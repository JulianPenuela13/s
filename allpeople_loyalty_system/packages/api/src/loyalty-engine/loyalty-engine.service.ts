// packages/api/src/loyalty-engine/loyalty-engine.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Purchase } from '../purchases/purchase.entity';
import { PointsTransaction } from './points-transaction.entity';
import { LoyaltyStrategy } from './loyalty-strategy.entity';
import { CashbackLedger } from './cashback-ledger.entity';
import { ClientProgress } from './client-progress.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { Client } from '../clients/client.entity';
import { Reward } from '../rewards/reward.entity';
import { Actor } from '../audit/actor.interface';

@Injectable()
export class LoyaltyEngineService {
  private readonly logger = new Logger(LoyaltyEngineService.name);

  constructor(
    @InjectRepository(PointsTransaction) private pointsRepository: Repository<PointsTransaction>,
    @InjectRepository(LoyaltyStrategy) private strategyRepository: Repository<LoyaltyStrategy>,
    @InjectRepository(CashbackLedger) private cashbackRepository: Repository<CashbackLedger>,
    @InjectRepository(ClientProgress) private progressRepository: Repository<ClientProgress>,
    @InjectRepository(UnlockedReward) private unlockedRewardRepository: Repository<UnlockedReward>,
    @InjectRepository(Reward) private rewardsRepository: Repository<Reward>,
    private eventEmitter: EventEmitter2,
  ) {}

  // 1. El método ahora recibe el 'actor' y sabe para qué empresa trabajar
  async processPurchase(purchase: Purchase, actor: Actor): Promise<any> {
    const empresaId = actor.empresaId;
    const client = purchase.client;

    const currentPoints = await this.getClientTotalPoints(client.id, empresaId);
    
    // 2. Buscamos solo las estrategias de la empresa correcta
    const activeStrategies = await this.strategyRepository.findBy({ is_active: true, empresa_id: empresaId });
    
    const benefitsAwarded = {
      points_earned: 0,
      cashback_earned: 0,
      reward_unlocked: false,
      progress_updates: [] as { strategy_name: string; progress_text: string }[],
    };

    let pointsMultiplier = 1;
    let potentialPoints = 0;
    
    const pointsStrategyConfig = activeStrategies.find(s => s.key === 'points');
    if (pointsStrategyConfig && pointsStrategyConfig.settings && pointsStrategyConfig.settings.points_per_cop > 0) {
      potentialPoints = Math.floor(purchase.amount / pointsStrategyConfig.settings.points_per_cop);
    }

    const campaignStrategy = activeStrategies.find(s => s.key === 'campaigns');
    if (campaignStrategy?.settings) {
      const now = new Date();
      const startDate = new Date(campaignStrategy.settings.start_date);
      const endDate = new Date(campaignStrategy.settings.end_date);
      endDate.setHours(23, 59, 59, 999);
      if (now >= startDate && now <= endDate) {
        pointsMultiplier = campaignStrategy.settings.multiplier || 1;
      }
    }
    
    const newTotalPointsAfterPurchase = currentPoints + (potentialPoints * pointsMultiplier);

    for (const strategy of activeStrategies) {
      switch (strategy.key) {
        case 'points':
          if (potentialPoints > 0) {
            benefitsAwarded.points_earned += potentialPoints * pointsMultiplier;
          }
          break;
        case 'cashback':
          if (strategy.settings?.percentage > 0) {
            benefitsAwarded.cashback_earned += purchase.amount * (strategy.settings.percentage / 100);
          }
          break;
        case 'frequency':
        case 'random_prizes':
          const target_step = strategy.settings.required_purchases || strategy.settings.trigger_on_purchase_count;
          if (target_step > 0) {
            await this.handleProgressBasedStrategies(purchase, strategy, target_step, benefitsAwarded);
          }
          break;
        case 'secret_rewards':
          const pointsThreshold = strategy.settings?.points_threshold;
          if (pointsThreshold > 0 && strategy.settings?.reward_to_unlock_id) {
            if (newTotalPointsAfterPurchase >= pointsThreshold && currentPoints < pointsThreshold) {
              await this.unlockRewardForClient(client, strategy.settings.reward_to_unlock_id, strategy);
              benefitsAwarded.reward_unlocked = true;
            }
          }
          break;
      }
    }
    
    await this.saveBenefits(purchase, benefitsAwarded, potentialPoints);
    const finalTotalPoints = currentPoints + benefitsAwarded.points_earned;
    this.eventEmitter.emit('purchase.processed', { client: purchase.client, benefits: benefitsAwarded, newTotalPoints: finalTotalPoints });
    return benefitsAwarded;
  }

  private async handleProgressBasedStrategies(purchase: Purchase, strategy: LoyaltyStrategy, target_step: number, benefits: any) {
    const empresaId = purchase.empresa_id;
    let progress = await this.progressRepository.findOne({ where: { client: { id: purchase.client.id }, strategy: { id: strategy.id }, empresa_id: empresaId } });
    if (!progress) {
      progress = this.progressRepository.create({ client: purchase.client, strategy: strategy, progress_value: 0, empresa_id: empresaId });
    }
    progress.progress_value++;
    benefits.progress_updates.push({ strategy_name: strategy.name, progress_text: `${progress.progress_value} de ${target_step}` });

    if (progress.progress_value >= target_step) {
      benefits.reward_unlocked = true;
      if (strategy.key === 'random_prizes' && strategy.settings?.reward_pool_ids?.length > 0) {
        await this.unlockRandomReward(purchase.client, strategy.settings.reward_pool_ids, strategy);
      }
      if (strategy.key === 'frequency' && strategy.settings?.reward_to_unlock_id) {
        await this.unlockRewardForClient(purchase.client, strategy.settings.reward_to_unlock_id, strategy);
      }
      progress.progress_value = 0; // Reiniciamos el progreso
    }
    await this.progressRepository.save(progress);
  }

  private async unlockRewardForClient(client: Client, rewardId: string, strategy: LoyaltyStrategy) {
    const empresaId = client.empresa_id;
    const existingUnlock = await this.unlockedRewardRepository.findOneBy({ client: { id: client.id }, reward: { id: rewardId }, empresa_id: empresaId });
    if (existingUnlock) return;

    const unlockedReward = this.unlockedRewardRepository.create({ client, reward: { id: rewardId }, strategy, empresa_id: empresaId });
    await this.unlockedRewardRepository.save(unlockedReward);
  }

  private async unlockRandomReward(client: Client, rewardPoolIds: string[], strategy: LoyaltyStrategy) {
    const activeRewardsInPool = await this.rewardsRepository.find({
      where: { id: In(rewardPoolIds), is_active: true, empresa_id: client.empresa_id },
    });
    if (activeRewardsInPool.length === 0) return;
    
    const randomReward = activeRewardsInPool[Math.floor(Math.random() * activeRewardsInPool.length)];
    await this.unlockRewardForClient(client, randomReward.id, strategy);
  }

  private async saveBenefits(purchase: Purchase, benefits: any, potentialPoints: number) {
    if (benefits.points_earned > 0) {
      const basePoints = potentialPoints;
      const bonusPoints = benefits.points_earned - basePoints;
      await this.savePointsTransaction(purchase, benefits.points_earned, basePoints, bonusPoints);
    }
    if (benefits.cashback_earned > 0) {
      await this.saveCashbackTransaction(purchase, benefits.cashback_earned);
    }
  }

  private async getClientTotalPoints(clientId: string, empresaId: number): Promise<number> {
    const result = await this.pointsRepository.createQueryBuilder('tx')
        .select('SUM(tx.points_change)', 'total')
        .where('"clientId" = :clientId', { clientId })
        .andWhere('tx.empresa_id = :empresaId', { empresaId })
        .getRawOne();
    return parseInt(result?.total, 10) || 0;
  }

  private async savePointsTransaction(purchase: Purchase, totalPoints: number, basePoints: number, bonusPoints: number) {
    const empresaId = purchase.empresa_id;
    const pointsStrategy = await this.strategyRepository.findOneBy({ key: 'points', empresa_id: empresaId });
    let expirationDate: Date | null = null;

    if (pointsStrategy?.settings?.expiration_enabled && pointsStrategy.settings.expiration_days > 0) {
      expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + pointsStrategy.settings.expiration_days);
    }

    const transaction = this.pointsRepository.create({
      client: purchase.client,
      purchase: purchase,
      points_change: totalPoints,
      base_points: basePoints,
      bonus_points: bonusPoints,
      reason: 'Puntos por compra',
      expires_at: expirationDate,
      empresa_id: empresaId,
    });
    await this.pointsRepository.save(transaction);
  }

  private async saveCashbackTransaction(purchase: Purchase, amount: number) {
    const transaction = this.cashbackRepository.create({
      client: purchase.client,
      purchase: purchase,
      amount_change: amount,
      reason: 'Cashback por compra',
      empresa_id: purchase.empresa_id,
    });
    await this.cashbackRepository.save(transaction);
  }
}