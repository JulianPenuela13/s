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
import { Reward } from '../rewards/reward.entity'; // <-- LA IMPORTACIÓN QUE FALTABA

@Injectable()
export class LoyaltyEngineService {
  private readonly logger = new Logger(LoyaltyEngineService.name);

  constructor(
    @InjectRepository(PointsTransaction)
    private pointsRepository: Repository<PointsTransaction>,
    @InjectRepository(LoyaltyStrategy)
    private strategyRepository: Repository<LoyaltyStrategy>,
    @InjectRepository(CashbackLedger)
    private cashbackRepository: Repository<CashbackLedger>,
    @InjectRepository(ClientProgress)
    private progressRepository: Repository<ClientProgress>,
    @InjectRepository(UnlockedReward)
    private unlockedRewardRepository: Repository<UnlockedReward>,
    @InjectRepository(Reward) // Inyectamos el repo de Reward
    private rewardsRepository: Repository<Reward>,
    private eventEmitter: EventEmitter2,
  ) {}

  async processPurchase(purchase: Purchase): Promise<any> {
    const currentPoints = await this.getClientTotalPoints(purchase.client.id);
    const activeStrategies = await this.strategyRepository.findBy({ is_active: true });
    
    const benefitsAwarded = {
      points_earned: 0,
      cashback_earned: 0,
      reward_unlocked: false,
      progress_updates: [] as { strategy_name: string; progress_text: string }[],
    };

    let pointsMultiplier = 1;
    let potentialPoints = 0;
    
    const pointsStrategyConfig = await this.strategyRepository.findOneBy({ key: 'points' });
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
        if(pointsMultiplier > 1) this.logger.log(`Active campaign found! Applying x${pointsMultiplier} points multiplier.`);
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
              await this.unlockRewardForClient(purchase.client, strategy.settings.reward_to_unlock_id, strategy);
              benefitsAwarded.reward_unlocked = true;
            }
          }
          break;
      }
    }
    
    await this.saveBenefits(purchase, benefitsAwarded, potentialPoints);
    const finalTotalPoints = currentPoints + benefitsAwarded.points_earned;
    this.eventEmitter.emit('purchase.processed', { client: purchase.client, benefits: benefitsAwarded, newTotalPoints: finalTotalPoints });
    this.logger.log('Dispatched purchase.processed event.');
    return benefitsAwarded;
  }

  private async handleProgressBasedStrategies(purchase: Purchase, strategy: LoyaltyStrategy, target_step: number, benefits: any) {
    let progress = await this.progressRepository.findOne({ where: { client: { id: purchase.client.id }, strategy: { id: strategy.id } } });
    if (!progress) {
      progress = this.progressRepository.create({ client: { id: purchase.client.id }, strategy: { id: strategy.id }, progress_value: 0 });
    }
    progress.progress_value++;
    const progress_text = `${progress.progress_value} de ${target_step}`;
    benefits.progress_updates.push({ strategy_name: strategy.name, progress_text });
    this.logger.log(`Client progress for '${strategy.name}' is now ${progress_text}`);
    if (progress.progress_value >= target_step) {
      this.logger.log(`Client has met the target for ${strategy.name}!`);
      benefits.reward_unlocked = true;
      if (strategy.key === 'random_prizes' && strategy.settings?.reward_pool_ids?.length > 0) {
        await this.unlockRandomReward(purchase.client, strategy.settings.reward_pool_ids, strategy);
      }
      if (strategy.key === 'frequency' && strategy.settings?.reward_to_unlock_id) {
        await this.unlockRewardForClient(purchase.client, strategy.settings.reward_to_unlock_id, strategy);
      }
      progress.progress_value = 0;
    }
    await this.progressRepository.save(progress);
    this.logger.log(`Progress saved for strategy '${strategy.name}'.`);
  }

  private async unlockRewardForClient(client: Client, rewardId: string, strategy: LoyaltyStrategy) {
    const existingUnlock = await this.unlockedRewardRepository.findOneBy({ client: { id: client.id }, reward: { id: rewardId } });
    if (existingUnlock) {
      this.logger.log(`Client ${client.id} already has reward ${rewardId} unlocked. Skipping.`);
      return;
    }
    this.logger.log(`Unlocking reward ${rewardId} for client ${client.id} via strategy ${strategy.name}`);
    const unlockedReward = this.unlockedRewardRepository.create({ client: { id: client.id }, reward: { id: rewardId }, strategy: { id: strategy.id } });
    await this.unlockedRewardRepository.save(unlockedReward);
  }

  private async unlockRandomReward(client: Client, rewardPoolIds: string[], strategy: LoyaltyStrategy) {
    const activeRewardsInPool = await this.rewardsRepository.find({
      where: { id: In(rewardPoolIds), is_active: true },
    });
    if (activeRewardsInPool.length === 0) {
      this.logger.warn(`Random prize trigger met, but no active rewards found in the pool for strategy ${strategy.name}.`);
      return;
    }
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

  private async getClientTotalPoints(clientId: string): Promise<number> {
    const result = await this.pointsRepository.createQueryBuilder('tx').select('SUM(tx.points_change)', 'total').where('"clientId" = :clientId', { clientId }).getRawOne();
    return parseInt(result?.total, 10) || 0;
  }

  private async savePointsTransaction(purchase: Purchase, totalPoints: number, basePoints: number, bonusPoints: number) {
    // Buscamos la configuración de la estrategia de puntos
    const pointsStrategy = await this.strategyRepository.findOneBy({ key: 'points' });
    let expirationDate: Date | null = null;

    // Si la estrategia tiene la expiración activada y un número de días válido...
    if (pointsStrategy?.settings?.expiration_enabled && pointsStrategy.settings.expiration_days > 0) {
      expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + pointsStrategy.settings.expiration_days);
      this.logger.log(`Points will expire on: ${expirationDate.toISOString()}`);
    }

    const transaction = this.pointsRepository.create({
      client: { id: purchase.client.id },
      purchase: { id: purchase.id },
      points_change: totalPoints,
      base_points: basePoints,
      bonus_points: bonusPoints,
      reason: 'Puntos por compra',
      expires_at: expirationDate, // Guardamos la fecha de vencimiento
    });

    await this.pointsRepository.save(transaction);
    this.logger.log(`Awarded ${totalPoints} points (${basePoints} base + ${bonusPoints} bonus).`);
}

  private async saveCashbackTransaction(purchase: Purchase, amount: number) {
    const transaction = this.cashbackRepository.create({
      client: { id: purchase.client.id },
      purchase: { id: purchase.id },
      amount_change: amount,
      reason: 'Cashback por compra',
    });
    await this.cashbackRepository.save(transaction);
    this.logger.log(`Awarded $${amount.toFixed(2)} cashback.`);
  }
}