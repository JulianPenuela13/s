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
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reward_entity_1 = require("./reward.entity");
const audit_service_1 = require("../audit/audit.service");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
let RewardsService = class RewardsService {
    rewardsRepository;
    strategyRepository;
    auditService;
    constructor(rewardsRepository, strategyRepository, auditService) {
        this.rewardsRepository = rewardsRepository;
        this.strategyRepository = strategyRepository;
        this.auditService = auditService;
    }
    async create(createRewardDto, actor) {
        if (!actor.empresaId) {
            throw new common_1.UnauthorizedException('El actor debe tener una empresa asociada.');
        }
        const reward = this.rewardsRepository.create({
            ...createRewardDto,
            empresa_id: actor.empresaId,
        });
        const savedReward = await this.rewardsRepository.save(reward);
        await this.auditService.logAction(actor, 'REWARD_CREATE', { rewardId: savedReward.id, rewardName: savedReward.name });
        return savedReward;
    }
    async findAll(user, context) {
        const empresaId = user.empresaId;
        if (context === 'redemption') {
            const pointsStrategy = await this.strategyRepository.findOne({
                where: { key: 'points', is_active: true, empresa_id: empresaId }
            });
            if (!pointsStrategy) {
                return [];
            }
            return this.rewardsRepository.find({
                where: { type: reward_entity_1.RewardType.STANDARD, cost_in_points: (0, typeorm_2.MoreThan)(0), is_active: true, empresa_id: empresaId },
                order: { name: 'ASC' },
            });
        }
        return this.rewardsRepository.find({
            where: { empresa_id: empresaId },
            order: { name: 'ASC' }
        });
    }
    async findOne(id, user) {
        const reward = await this.rewardsRepository.findOne({
            where: { id: id, empresa_id: user.empresaId },
        });
        if (!reward) {
            throw new common_1.NotFoundException(`Recompensa con ID "${id}" no encontrada.`);
        }
        return reward;
    }
    async update(id, updateRewardDto, actor) {
        const rewardToUpdate = await this.findOne(id, actor);
        if (Object.keys(updateRewardDto).length === 0) {
            return rewardToUpdate;
        }
        await this.rewardsRepository.update(id, updateRewardDto);
        await this.auditService.logAction(actor, 'REWARD_UPDATE', {
            rewardId: rewardToUpdate.id,
            rewardName: rewardToUpdate.name,
            changes: updateRewardDto,
        });
        return this.findOne(id, actor);
    }
    async remove(id, actor) {
        const rewardToRemove = await this.findOne(id, actor);
        const result = await this.rewardsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Recompensa con ID "${id}" no encontrada.`);
        }
        await this.auditService.logAction(actor, 'REWARD_DELETE', { rewardId: rewardToRemove.id, rewardName: rewardToRemove.name });
    }
    async decrementStock(id, empresaId) {
        await this.rewardsRepository.decrement({ id: id, empresa_id: empresaId }, 'stock', 1);
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reward_entity_1.Reward)),
    __param(1, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map