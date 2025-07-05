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
const reward_entity_1 = require("../rewards/reward.entity");
const points_transaction_entity_1 = require("../points/points-transaction.entity");
const rule_entity_1 = require("../rules/rule.entity");
const unlocked_reward_entity_1 = require("../unlocked-rewards/unlocked-reward.entity");
let LoyaltyEngineService = LoyaltyEngineService_1 = class LoyaltyEngineService {
    ruleRepository;
    rewardRepository;
    unlockedRewardRepository;
    pointsTransactionRepository;
    logger = new common_1.Logger(LoyaltyEngineService_1.name);
    constructor(ruleRepository, rewardRepository, unlockedRewardRepository, pointsTransactionRepository) {
        this.ruleRepository = ruleRepository;
        this.rewardRepository = rewardRepository;
        this.unlockedRewardRepository = unlockedRewardRepository;
        this.pointsTransactionRepository = pointsTransactionRepository;
    }
    async processPurchase(purchase, client) {
        const empresaId = purchase.empresa_id;
        this.logger.log(`Procesando compra ${purchase.id} para cliente ${client.id} en empresa ${empresaId}`);
        const applicableRules = await this.findApplicableRules(purchase, client, empresaId);
        const result = {
            pointsEarned: 0,
            unlockedRewards: [],
        };
        for (const rule of applicableRules) {
            const outcome = this.executeRule(rule);
            if (outcome) {
                if (outcome.points) {
                    result.pointsEarned += outcome.points;
                    await this.recordPointsTransaction(client.id, outcome.points, purchase.id, rule.id, empresaId);
                }
                if (outcome.rewardId) {
                    const unlocked = await this.unlockRewardForClient(client.id, outcome.rewardId, empresaId);
                    const rewardDetails = await this.rewardRepository.findOneBy({ id: outcome.rewardId, empresa_id: empresaId });
                    if (unlocked && rewardDetails) {
                        result.unlockedRewards.push(rewardDetails);
                    }
                }
            }
        }
        this.logger.log(`Compra ${purchase.id} procesada. Puntos ganados: ${result.pointsEarned}.`);
        return result;
    }
    async findApplicableRules(purchase, client, empresaId) {
        const allActiveRules = await this.ruleRepository.find({
            where: { is_active: true, empresa_id: empresaId },
        });
        return allActiveRules.filter(rule => {
            switch (rule.type) {
                case rule_entity_1.RuleType.PURCHASE_AMOUNT:
                    return purchase.amount >= rule.threshold;
                default:
                    return false;
            }
        });
    }
    executeRule(rule) {
        if (rule.action_type === 'grant_points') {
            return { points: parseInt(rule.action_value, 10) };
        }
        if (rule.action_type === 'unlock_reward') {
            return { rewardId: rule.action_value };
        }
        return null;
    }
    async unlockRewardForClient(clientId, rewardId, empresaId) {
        const existing = await this.unlockedRewardRepository.findOne({
            where: { client_id: clientId, reward_id: rewardId, empresa_id: empresaId },
        });
        if (existing) {
            this.logger.log(`El cliente ${clientId} ya tiene desbloqueada la recompensa ${rewardId}.`);
            return false;
        }
        const newUnlock = this.unlockedRewardRepository.create({
            client_id: clientId,
            reward_id: rewardId,
            empresa_id: empresaId,
        });
        await this.unlockedRewardRepository.save(newUnlock);
        this.logger.log(`Recompensa ${rewardId} desbloqueada para el cliente ${clientId}.`);
        return true;
    }
    async recordPointsTransaction(clientId, points, purchaseId, ruleId, empresaId) {
        const transaction = this.pointsTransactionRepository.create({
            client_id: clientId,
            points_earned: points,
            purchase_id: purchaseId,
            rule_id: ruleId,
            empresa_id: empresaId,
        });
        await this.pointsTransactionRepository.save(transaction);
    }
};
exports.LoyaltyEngineService = LoyaltyEngineService;
exports.LoyaltyEngineService = LoyaltyEngineService = LoyaltyEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rule_entity_1.Rule)),
    __param(1, (0, typeorm_1.InjectRepository)(reward_entity_1.Reward)),
    __param(2, (0, typeorm_1.InjectRepository)(unlocked_reward_entity_1.UnlockedReward)),
    __param(3, (0, typeorm_1.InjectRepository)(points_transaction_entity_1.PointsTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LoyaltyEngineService);
//# sourceMappingURL=loyalty-engine.service.js.map