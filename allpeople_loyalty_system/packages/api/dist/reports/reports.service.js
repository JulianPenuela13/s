"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_entity_1 = require("../clients/client.entity");
const redemption_entity_1 = require("../rewards/redemption.entity");
const points_transaction_entity_1 = require("../loyalty-engine/points-transaction.entity");
const purchase_entity_1 = require("../purchases/purchase.entity");
const cashback_ledger_entity_1 = require("../loyalty-engine/cashback-ledger.entity");
const unlocked_reward_entity_1 = require("../rewards/unlocked-reward.entity");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
let ReportsService = class ReportsService {
    clientsRepo;
    redemptionsRepo;
    pointsRepo;
    purchaseRepository;
    cashbackRepo;
    unlockedRewardRepo;
    strategyRepo;
    constructor(clientsRepo, redemptionsRepo, pointsRepo, purchaseRepository, cashbackRepo, unlockedRewardRepo, strategyRepo) {
        this.clientsRepo = clientsRepo;
        this.redemptionsRepo = redemptionsRepo;
        this.pointsRepo = pointsRepo;
        this.purchaseRepository = purchaseRepository;
        this.cashbackRepo = cashbackRepo;
        this.unlockedRewardRepo = unlockedRewardRepo;
        this.strategyRepo = strategyRepo;
    }
    async getDashboardStats(actor) {
        const empresaId = actor.empresaId;
        const whereClause = { where: { empresa_id: empresaId } };
        const activeStrategies = await this.strategyRepo.findBy({ is_active: true, empresa_id: empresaId });
        const activeKeys = activeStrategies.map(s => s.key);
        const stats = {};
        const [totalClients, totalPurchases, totalRedemptions] = await Promise.all([
            this.clientsRepo.count(whereClause),
            this.purchaseRepository.count(whereClause),
            this.redemptionsRepo.count(whereClause),
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
                .where('tx.empresa_id = :empresaId', { empresaId })
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
                .andWhere("cb.empresa_id = :empresaId", { empresaId })
                .getRawOne();
            stats.totalCashbackEarned = parseFloat(cashbackResult?.total) || 0;
        }
        const getCountForStrategy = async (strategyKey) => {
            const strategy = activeStrategies.find(s => s.key === strategyKey);
            if (!strategy)
                return 0;
            return this.redemptionsRepo.count({ where: { strategy: { id: strategy.id }, empresa_id: empresaId } });
        };
        const [freq, random, secret] = await Promise.all([
            getCountForStrategy('frequency'),
            getCountForStrategy('random_prizes'),
            getCountForStrategy('secret_rewards')
        ]);
        if (activeKeys.includes('frequency'))
            stats.rewardsFromFrequency = freq;
        if (activeKeys.includes('random_prizes'))
            stats.rewardsFromRandom = random;
        if (activeKeys.includes('secret_rewards'))
            stats.rewardsFromSecret = secret;
        return stats;
    }
    async getDynamicReportTables(actor) {
        const empresaId = actor.empresaId;
        const activeStrategies = await this.strategyRepo.findBy({ is_active: true, empresa_id: empresaId });
        const tables = [];
        if (activeStrategies.some(s => s.key === 'points')) {
            const data = await this.pointsRepo.createQueryBuilder("tx")
                .select("client.full_name", "Cliente")
                .addSelect("SUM(tx.points_change)::int", "Puntos Totales")
                .innerJoin("tx.client", "client")
                .where("tx.points_change > 0")
                .andWhere("tx.empresa_id = :empresaId", { empresaId })
                .groupBy("client.id").orderBy("\"Puntos Totales\"", "DESC").limit(5).getRawMany();
            if (data.length > 0)
                tables.push({ title: 'Top Clientes (por Puntos)', data });
        }
        if (activeStrategies.some(s => s.key === 'frequency')) {
            const data = await this.purchaseRepository.createQueryBuilder("purchase")
                .select("client.full_name", "Cliente")
                .addSelect("COUNT(purchase.id)", "Total Compras")
                .innerJoin("purchase.client", "client")
                .where("purchase.empresa_id = :empresaId", { empresaId })
                .groupBy("client.id").orderBy("\"Total Compras\"", "DESC").limit(5).getRawMany();
            if (data.length > 0)
                tables.push({ title: 'Top Clientes (por Frecuencia)', data });
        }
        return tables;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(1, (0, typeorm_1.InjectRepository)(redemption_entity_1.Redemption)),
    __param(2, (0, typeorm_1.InjectRepository)(points_transaction_entity_1.PointsTransaction)),
    __param(3, (0, typeorm_1.InjectRepository)(purchase_entity_1.Purchase)),
    __param(4, (0, typeorm_1.InjectRepository)(cashback_ledger_entity_1.CashbackLedger)),
    __param(5, (0, typeorm_1.InjectRepository)(unlocked_reward_entity_1.UnlockedReward)),
    __param(6, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map