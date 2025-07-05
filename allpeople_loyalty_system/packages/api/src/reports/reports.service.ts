// packages/api/src/reports/reports.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Redemption } from '../rewards/redemption.entity';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { Purchase } from '../purchases/purchase.entity';
import { CashbackLedger } from '../loyalty-engine/cashback-ledger.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Client) private clientsRepo: Repository<Client>,
    @InjectRepository(Redemption) private redemptionsRepo: Repository<Redemption>,
    @InjectRepository(PointsTransaction) private pointsRepo: Repository<PointsTransaction>,
    @InjectRepository(Purchase) private purchaseRepository: Repository<Purchase>,
    @InjectRepository(CashbackLedger) private cashbackRepo: Repository<CashbackLedger>,
    @InjectRepository(UnlockedReward) private unlockedRewardRepo: Repository<UnlockedReward>,
    @InjectRepository(LoyaltyStrategy) private strategyRepo: Repository<LoyaltyStrategy>,
  ) {}

async getDashboardStats() {
    const activeStrategies = await this.strategyRepo.findBy({ is_active: true });
    const activeKeys = activeStrategies.map(s => s.key);
    const stats: any = {};

    const [totalClients, totalPurchases, totalRedemptions] = await Promise.all([
      this.clientsRepo.count(),
      this.purchaseRepository.count(),
      this.redemptionsRepo.count(),
    ]);
    stats.totalClients = totalClients;
    stats.totalPurchases = totalPurchases;
    stats.totalRedemptions = totalRedemptions;

    if (activeKeys.includes('points')) {
      const pointsResult = await this.pointsRepo.createQueryBuilder('tx')
        .select('SUM(CASE WHEN tx.points_change > 0 THEN tx.points_change ELSE 0 END)', 'earned')
        .addSelect('SUM(CASE WHEN tx.points_change < 0 AND tx.reason NOT LIKE :expiredReason THEN tx.points_change ELSE 0 END)', 'redeemed')
        .addSelect('SUM(CASE WHEN tx.reason LIKE :expiredReason THEN tx.points_change ELSE 0 END)', 'expired')
        .addSelect('SUM(tx.bonus_points)', 'bonus')
        .setParameter('expiredReason', 'Vencimiento de puntos%')
        .getRawOne();
      
      stats.totalPointsEarned = parseInt(pointsResult?.earned, 10) || 0;
      stats.totalPointsRedeemed = Math.abs(parseInt(pointsResult?.redeemed, 10)) || 0;
      stats.totalCampaignPoints = parseInt(pointsResult?.bonus, 10) || 0;
      stats.totalPointsExpired = Math.abs(parseInt(pointsResult?.expired, 10)) || 0;
    }

    if (activeKeys.includes('cashback')) {
      const cashbackResult = await this.cashbackRepo.createQueryBuilder("cb").select("SUM(cb.amount_change)", "total").where("cb.amount_change > 0").getRawOne();
      stats.totalCashbackEarned = parseFloat(cashbackResult?.total) || 0;
    }

    const getCountForStrategy = async (strategyKey: string) => {
      const strategy = activeStrategies.find(s => s.key === strategyKey);
      if (!strategy) return 0;
      return this.redemptionsRepo.count({ where: { strategy: { id: strategy.id } } });
    };

    const [freq, random, secret] = await Promise.all([
        getCountForStrategy('frequency'),
        getCountForStrategy('random_prizes'),
        getCountForStrategy('secret_rewards')
    ]);

    if (activeKeys.includes('frequency')) stats.rewardsFromFrequency = freq;
    if (activeKeys.includes('random_prizes')) stats.rewardsFromRandom = random;
    if (activeKeys.includes('secret_rewards')) stats.rewardsFromSecret = secret;

    return stats;
  }

  async getDynamicReportTables() {
    const activeStrategies = await this.strategyRepo.findBy({ is_active: true });
    const tables: { title: string; data: any[] }[] = [];

    if (activeStrategies.some(s => s.key === 'points')) {
      const data = await this.pointsRepo.createQueryBuilder("tx")
        .select("client.full_name", "Cliente")
        .addSelect("SUM(tx.points_change)::int", "Puntos Totales")
        .innerJoin("tx.client", "client").where("tx.points_change > 0")
        .groupBy("client.id").orderBy("\"Puntos Totales\"", "DESC").limit(5).getRawMany();
      if (data.length > 0) tables.push({ title: 'Top Clientes (por Puntos)', data });
    }

    if (activeStrategies.some(s => s.key === 'frequency')) {
      const data = await this.purchaseRepository.createQueryBuilder("purchase")
        .select("client.full_name", "Cliente")
        .addSelect("COUNT(purchase.id)", "Total Compras")
        .innerJoin("purchase.client", "client")
        .groupBy("client.id").orderBy("\"Total Compras\"", "DESC").limit(5).getRawMany();
      if (data.length > 0) tables.push({ title: 'Top Clientes (por Frecuencia)', data });
    }

    if (activeStrategies.some(s => s.key === 'cashback')) {
        const data = await this.cashbackRepo.createQueryBuilder("ledger")
            .select("client.full_name", "Cliente")
            .addSelect("SUM(ledger.amount_change)", "Cashback Ganado")
            .innerJoin("ledger.client", "client")
            .where("ledger.amount_change > 0")
            .groupBy("client.id").orderBy("\"Cashback Ganado\"", "DESC").limit(5).getRawMany();
        if (data.length > 0) {
            data.forEach(row => row['Cashback Ganado'] = parseFloat(row['Cashback Ganado']).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }));
            tables.push({ title: 'Top Clientes (por Cashback)', data });
        }
    }

    // --- NUEVA TABLA: Top Clientes por Recompensas Secretas ---
    if (activeStrategies.some(s => s.key === 'secret_rewards')) {
      const data = await this.unlockedRewardRepo.createQueryBuilder("unlocked")
        .select("client.full_name", "Cliente")
        .addSelect("COUNT(unlocked.id)", "Premios Secretos Obtenidos")
        .innerJoin("unlocked.client", "client")
        .innerJoin("unlocked.strategy", "strategy", "strategy.key = :key", { key: 'secret_rewards' })
        .groupBy("client.id").orderBy("\"Premios Secretos Obtenidos\"", "DESC").limit(5).getRawMany();
      if (data.length > 0) tables.push({ title: 'Top Clientes (Recompensas Secretas)', data });
    }

    // --- NUEVA TABLA: Top Clientes por Premios Aleatorios ---
    if (activeStrategies.some(s => s.key === 'random_prizes')) {
      const data = await this.unlockedRewardRepo.createQueryBuilder("unlocked")
        .select("client.full_name", "Cliente")
        .addSelect("COUNT(unlocked.id)", "Premios Aleatorios Obtenidos")
        .innerJoin("unlocked.client", "client")
        .innerJoin("unlocked.strategy", "strategy", "strategy.key = :key", { key: 'random_prizes' })
        .groupBy("client.id").orderBy("\"Premios Aleatorios Obtenidos\"", "DESC").limit(5).getRawMany();
      if (data.length > 0) tables.push({ title: 'Top Clientes (Premios Aleatorios)', data });
    }

    const redemptionPossible = activeStrategies.some(s => ['points', 'frequency', 'random_prizes', 'secret_rewards'].includes(s.key));
    if (redemptionPossible) {
      const data = await this.redemptionsRepo.createQueryBuilder("redemption")
        .select("reward.name", "Recompensa").addSelect("COUNT(redemption.id)", "Total Canjes")
        .innerJoin("redemption.reward", "reward")
        .groupBy("reward.id").orderBy("\"Total Canjes\"", "DESC").limit(5).getRawMany();
      if (data.length > 0) tables.push({ title: 'Top Recompensas (por Canjes)', data });
    }

    return tables;
  }
}