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
var LoyaltyEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyEngineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const points_transaction_entity_1 = require("./points-transaction.entity");
const loyalty_strategy_entity_1 = require("./loyalty-strategy.entity");
const cashback_ledger_entity_1 = require("./cashback-ledger.entity");
const client_progress_entity_1 = require("./client-progress.entity");
const unlocked_reward_entity_1 = require("../rewards/unlocked-reward.entity");
const reward_entity_1 = require("../rewards/reward.entity");
let LoyaltyEngineService = LoyaltyEngineService_1 = class LoyaltyEngineService {
    pointsRepository;
    strategyRepository;
    cashbackRepository;
    progressRepository;
    unlockedRewardRepository;
    rewardsRepository;
    eventEmitter;
    logger = new common_1.Logger(LoyaltyEngineService_1.name);
    constructor(pointsRepository, strategyRepository, cashbackRepository, progressRepository, unlockedRewardRepository, rewardsRepository, eventEmitter) {
        this.pointsRepository = pointsRepository;
        this.strategyRepository = strategyRepository;
        this.cashbackRepository = cashbackRepository;
        this.progressRepository = progressRepository;
        this.unlockedRewardRepository = unlockedRewardRepository;
        this.rewardsRepository = rewardsRepository;
        this.eventEmitter = eventEmitter;
    }
    async processPurchase(purchase, actor) {
        const empresaId = actor.empresaId;
        const client = purchase.client;
        const currentPoints = await this.getClientTotalPoints(client.id, empresaId);
        const activeStrategies = await this.strategyRepository.findBy({ is_active: true, empresa_id: empresaId });
        const benefitsAwarded = {
            points_earned: 0,
            cashback_earned: 0,
            reward_unlocked: false,
            progress_updates: [],
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
    async handleProgressBasedStrategies(purchase, strategy, target_step, benefits) {
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
            progress.progress_value = 0;
        }
        await this.progressRepository.save(progress);
    }
    async unlockRewardForClient(client, rewardId, strategy) {
        const empresaId = client.empresa_id;
        const existingUnlock = await this.unlockedRewardRepository.findOneBy({ client: { id: client.id }, reward: { id: rewardId }, empresa_id: empresaId });
        if (existingUnlock)
            return;
        const unlockedReward = this.unlockedRewardRepository.create({ client, reward: { id: rewardId }, strategy, empresa_id: empresaId });
        await this.unlockedRewardRepository.save(unlockedReward);
    }
    async unlockRandomReward(client, rewardPoolIds, strategy) {
        const activeRewardsInPool = await this.rewardsRepository.find({
            where: { id: (0, typeorm_2.In)(rewardPoolIds), is_active: true, empresa_id: client.empresa_id },
        });
        if (activeRewardsInPool.length === 0)
            return;
        const randomReward = activeRewardsInPool[Math.floor(Math.random() * activeRewardsInPool.length)];
        await this.unlockRewardForClient(client, randomReward.id, strategy);
    }
    async saveBenefits(purchase, benefits, potentialPoints) {
        if (benefits.points_earned > 0) {
            const basePoints = potentialPoints;
            const bonusPoints = benefits.points_earned - basePoints;
            await this.savePointsTransaction(purchase, benefits.points_earned, basePoints, bonusPoints);
        }
        if (benefits.cashback_earned > 0) {
            await this.saveCashbackTransaction(purchase, benefits.cashback_earned);
        }
    }
    async getClientTotalPoints(clientId, empresaId) {
        const result = await this.pointsRepository.createQueryBuilder('tx')
            .select('SUM(tx.points_change)', 'total')
            .where('"clientId" = :clientId', { clientId })
            .andWhere('tx.empresa_id = :empresaId', { empresaId })
            .getRawOne();
        return parseInt(result?.total, 10) || 0;
    }
    async savePointsTransaction(purchase, totalPoints, basePoints, bonusPoints) {
        const empresaId = purchase.empresa_id;
        const pointsStrategy = await this.strategyRepository.findOneBy({ key: 'points', empresa_id: empresaId });
        let expirationDate = null;
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
    async saveCashbackTransaction(purchase, amount) {
        const transaction = this.cashbackRepository.create({
            client: purchase.client,
            purchase: purchase,
            amount_change: amount,
            reason: 'Cashback por compra',
            empresa_id: purchase.empresa_id,
        });
        await this.cashbackRepository.save(transaction);
    }
};
exports.LoyaltyEngineService = LoyaltyEngineService;
exports.LoyaltyEngineService = LoyaltyEngineService = LoyaltyEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(points_transaction_entity_1.PointsTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __param(2, (0, typeorm_1.InjectRepository)(cashback_ledger_entity_1.CashbackLedger)),
    __param(3, (0, typeorm_1.InjectRepository)(client_progress_entity_1.ClientProgress)),
    __param(4, (0, typeorm_1.InjectRepository)(unlocked_reward_entity_1.UnlockedReward)),
    __param(5, (0, typeorm_1.InjectRepository)(reward_entity_1.Reward)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], LoyaltyEngineService);
//# sourceMappingURL=loyalty-engine.service.js.map