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
import { Actor } from '../audit/audit.service';
import { User } from '../users/user.entity';

@Injectable()
export class RedemptionsService {
  private readonly logger = new Logger(RedemptionsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly clientsService: ClientsService,
    private readonly rewardsService: RewardsService,
    private readonly whatsappService: WhatsappService,
    @InjectRepository(UnlockedReward)
    private readonly unlockedRewardRepo: Repository<UnlockedReward>,
  ) {}

  async redeem(dto: CreateRedemptionDto, cashier: Actor): Promise<Redemption> {
    const savedRedemption = await this.dataSource.transaction(async (transactionalEntityManager) => {
      const client = await transactionalEntityManager.findOneBy(Client, { id: dto.clientId });
      const reward = await transactionalEntityManager.findOneBy(Reward, { id: dto.rewardId });

      if (!client) throw new NotFoundException('Cliente no encontrado.');
      if (!reward) throw new NotFoundException('Recompensa no encontrada.');

      const unlockedReward = await transactionalEntityManager.findOne(UnlockedReward, {
        where: { client: { id: dto.clientId }, reward: { id: dto.rewardId } },
        relations: ['strategy'],
      });

      const redemptionData: Partial<Redemption> = { client, reward, user: { id: cashier.userId } as User };

      if (unlockedReward) {
        this.logger.log(`Processing a 'claim' for client ${dto.clientId}`);
        redemptionData.points_used = 0;
        redemptionData.strategy = unlockedReward.strategy;
        await transactionalEntityManager.remove(unlockedReward);
      } else {
        this.logger.log(`Processing a 'points purchase' for client ${dto.clientId}`);
        const pointsResult = await transactionalEntityManager.createQueryBuilder(PointsTransaction, 'tx')
          .select('SUM(tx.points_change)', 'total')
          .where('"clientId" = :clientId', { clientId: client.id })
          .getRawOne();
        const totalPoints = parseInt(pointsResult.total, 10) || 0;

        if (totalPoints < reward.cost_in_points) {
          throw new BadRequestException('El cliente no tiene suficientes puntos.');
        }

        const pointsDeduction = transactionalEntityManager.create(PointsTransaction, {
          client,
          points_change: -reward.cost_in_points,
          reason: `Canje de recompensa: ${reward.name}`,
        });
        await transactionalEntityManager.save(pointsDeduction);
        this.logger.log(`Points deducted successfully.`);
        redemptionData.points_used = reward.cost_in_points;
      }

      if (reward.stock !== -1) {
        if (reward.stock < 1) throw new BadRequestException('Recompensa sin stock.');
        await transactionalEntityManager.decrement(Reward, { id: reward.id }, 'stock', 1);
      }

      const redemption = transactionalEntityManager.create(Redemption, redemptionData);
      return transactionalEntityManager.save(redemption);
    });

    const finalClientState = await this.clientsService.findOne(dto.clientId);
    const finalRewardState = await this.rewardsService.findOne(dto.rewardId);
    const newTotalPoints = (await this.clientsService.getClientSummary(finalClientState.document_id)).total_points;
    
    await this.whatsappService.sendRedemptionNotification(finalClientState, finalRewardState, newTotalPoints);

    return savedRedemption;
  }
}