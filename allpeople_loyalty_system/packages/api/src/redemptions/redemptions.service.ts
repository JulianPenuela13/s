// packages/api/src/redemptions/redemptions.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Redemption } from '../rewards/redemption.entity';
import { CreateRedemptionDto } from './dto/create-redemption.dto';
import { Client } from '../clients/client.entity';
import { Reward } from '../rewards/reward.entity';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { ClientsService } from '../clients/clients.service';
import { RewardsService } from '../rewards/rewards.service';
import { Actor } from '../audit/actor.interface';
import { User } from '../users/user.entity';

@Injectable()
export class RedemptionsService {
  private readonly logger = new Logger(RedemptionsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly clientsService: ClientsService,
    private readonly rewardsService: RewardsService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async redeem(dto: CreateRedemptionDto, actor: Actor): Promise<Redemption> {
    const empresaId = actor.empresaId;

    const savedRedemption = await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 1. Buscamos el cliente y la recompensa DENTRO de la empresa correcta.
      const client = await transactionalEntityManager.findOneBy(Client, { id: dto.clientId, empresa_id: empresaId });
      const reward = await transactionalEntityManager.findOneBy(Reward, { id: dto.rewardId, empresa_id: empresaId });

      if (!client) throw new NotFoundException('Cliente no encontrado en esta empresa.');
      if (!reward) throw new NotFoundException('Recompensa no encontrada en esta empresa.');

      const unlockedReward = await transactionalEntityManager.findOne(UnlockedReward, {
        where: { client: { id: dto.clientId }, reward: { id: dto.rewardId }, empresa_id: empresaId },
        relations: ['strategy'],
      });

      const redemptionData: Partial<Redemption> = { client, reward, user: { id: actor.userId } as unknown as User, empresa_id: empresaId };

      if (unlockedReward) {
        this.logger.log(`Procesando canje 'claim' para cliente ${dto.clientId} en empresa ${empresaId}`);
        redemptionData.points_used = 0;
        redemptionData.strategy = unlockedReward.strategy;
        await transactionalEntityManager.remove(unlockedReward);
      } else {
        this.logger.log(`Procesando canje 'points purchase' para cliente ${dto.clientId} en empresa ${empresaId}`);
        
        // 2. Calculamos los puntos del cliente DENTRO de la empresa correcta.
        const pointsResult = await transactionalEntityManager.createQueryBuilder(PointsTransaction, 'tx')
          .select('SUM(tx.points_change)', 'total')
          .where('"clientId" = :clientId', { clientId: client.id })
          .andWhere('tx.empresa_id = :empresaId', { empresaId }) // <-- Filtro de seguridad
          .getRawOne();
        const totalPoints = parseInt(pointsResult.total, 10) || 0;

        if (totalPoints < reward.cost_in_points) {
          throw new BadRequestException('El cliente no tiene suficientes puntos.');
        }

        const pointsDeduction = transactionalEntityManager.create(PointsTransaction, {
          client,
          points_change: -reward.cost_in_points,
          reason: `Canje de recompensa: ${reward.name}`,
          empresa_id: empresaId, // <-- Asignamos la empresa
        });
        await transactionalEntityManager.save(pointsDeduction);
        this.logger.log(`Puntos deducidos exitosamente.`);
        redemptionData.points_used = reward.cost_in_points;
      }

      if (reward.stock !== -1) {
        if (reward.stock < 1) throw new BadRequestException('Recompensa sin stock.');
        await transactionalEntityManager.decrement(Reward, { id: reward.id, empresa_id: empresaId }, 'stock', 1);
      }

      const redemption = transactionalEntityManager.create(Redemption, redemptionData);
      return transactionalEntityManager.save(redemption);
    });

    // Estas llamadas ocurren fuera de la transacción, por lo que deben ser "tenant-aware"
    const finalClientState = await this.clientsService.findOne(dto.clientId, actor);
    const finalRewardState = await this.rewardsService.findOne(dto.rewardId, actor);
    const newTotalPoints = (await this.clientsService.getClientSummary(finalClientState.document_id, actor)).total_points;
    
    await this.whatsappService.sendRedemptionNotification(finalClientState, finalRewardState, newTotalPoints);

    return savedRedemption;
  }
}