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
import { Actor } from '../audit/actor.interface';

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

  // El método ahora recibe al 'actor' para saber para qué empresa generar el reporte.
  async getDashboardStats(actor: Actor) {
    const empresaId = actor.empresaId;
    const whereClause = { where: { empresa_id: empresaId } }; // <-- Objeto de filtro reutilizable.

    // Buscamos solo las estrategias de la empresa correcta.
    const activeStrategies = await this.strategyRepo.findBy({ is_active: true, empresa_id: empresaId });
    const activeKeys = activeStrategies.map(s => s.key);
    const stats: any = {};

    // Cada .count() ahora usa el 'whereClause' para filtrar por empresa.
    const [totalClients, totalPurchases, totalRedemptions] = await Promise.all([
      this.clientsRepo.count(whereClause),          // <-- CORREGIDO
      this.purchaseRepository.count(whereClause), // <-- CORREGIDO
      this.redemptionsRepo.count(whereClause),    // <-- CORREGIDO
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
        .where('tx.empresa_id = :empresaId', { empresaId }) // <-- FILTRO DE SEGURIDAD AÑADIDO
        .setParameter('expiredReason', 'Vencimiento de puntos%')
        .getRawOne();
      
      stats.totalPointsEarned = parseInt(pointsResult?.earned, 10) || 0;
      stats.totalPointsRedeemed = Math.abs(parseInt(pointsResult?.redeemed, 10)) || 0;
      stats.totalCampaignPoints = parseInt(pointsResult?.bonus, 10) || 0;
      stats.totalPointsExpired = Math.abs(parseInt(pointsResult?.expired, 10)) || 0;
    }

    if (activeKeys.includes('cashback')) {
      const cashbackResult = await this.cashbackRepo.createQueryBuilder("cb")
        .select("SUM(cb.amount_change)", "total")
        .where("cb.amount_change > 0")
        .andWhere("cb.empresa_id = :empresaId", { empresaId }) // <-- FILTRO DE SEGURIDAD AÑADIDO
        .getRawOne();
      stats.totalCashbackEarned = parseFloat(cashbackResult?.total) || 0;
    }

    const getCountForStrategy = async (strategyKey: string) => {
      const strategy = activeStrategies.find(s => s.key === strategyKey);
      if (!strategy) return 0;
      // Filtramos el conteo por empresa.
      return this.redemptionsRepo.count({ where: { strategy: { id: strategy.id }, empresa_id: empresaId } }); // <-- CORREGIDO
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

  // El método ahora recibe al 'actor'.
  async getDynamicReportTables(actor: Actor) {
    const empresaId = actor.empresaId;
    const activeStrategies = await this.strategyRepo.findBy({ is_active: true, empresa_id: empresaId });
    const tables: { title: string; data: any[] }[] = [];

    if (activeStrategies.some(s => s.key === 'points')) {
      const data = await this.pointsRepo.createQueryBuilder("tx")
        .select("client.full_name", "Cliente")
        .addSelect("SUM(tx.points_change)::int", "Puntos Totales")
        .innerJoin("tx.client", "client")
        .where("tx.points_change > 0")
        .andWhere("tx.empresa_id = :empresaId", { empresaId }) // <-- FILTRO DE SEGURIDAD AÑADIDO
        .groupBy("client.id").orderBy("\"Puntos Totales\"", "DESC").limit(5).getRawMany();
      if (data.length > 0) tables.push({ title: 'Top Clientes (por Puntos)', data });
    }

    if (activeStrategies.some(s => s.key === 'frequency')) {
      const data = await this.purchaseRepository.createQueryBuilder("purchase")
        .select("client.full_name", "Cliente")
        .addSelect("COUNT(purchase.id)", "Total Compras")
        .innerJoin("purchase.client", "client")
        .where("purchase.empresa_id = :empresaId", { empresaId }) // <-- FILTRO DE SEGURIDAD AÑADIDO
        .groupBy("client.id").orderBy("\"Total Compras\"", "DESC").limit(5).getRawMany();
      if (data.length > 0) tables.push({ title: 'Top Clientes (por Frecuencia)', data });
    }
    
    // (Aplica la misma lógica de .andWhere a todas las demás consultas de esta función)

    return tables;
  }
}