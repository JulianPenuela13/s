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
var RedemptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedemptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const redemption_entity_1 = require("../rewards/redemption.entity");
const client_entity_1 = require("../clients/client.entity");
const reward_entity_1 = require("../rewards/reward.entity");
const points_transaction_entity_1 = require("../loyalty-engine/points-transaction.entity");
const unlocked_reward_entity_1 = require("../rewards/unlocked-reward.entity");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
const clients_service_1 = require("../clients/clients.service");
const rewards_service_1 = require("../rewards/rewards.service");
let RedemptionsService = RedemptionsService_1 = class RedemptionsService {
    dataSource;
    clientsService;
    rewardsService;
    whatsappService;
    logger = new common_1.Logger(RedemptionsService_1.name);
    constructor(dataSource, clientsService, rewardsService, whatsappService) {
        this.dataSource = dataSource;
        this.clientsService = clientsService;
        this.rewardsService = rewardsService;
        this.whatsappService = whatsappService;
    }
    async redeem(dto, actor) {
        const empresaId = actor.empresaId;
        const savedRedemption = await this.dataSource.transaction(async (transactionalEntityManager) => {
            const client = await transactionalEntityManager.findOneBy(client_entity_1.Client, { id: dto.clientId, empresa_id: empresaId });
            const reward = await transactionalEntityManager.findOneBy(reward_entity_1.Reward, { id: dto.rewardId, empresa_id: empresaId });
            if (!client)
                throw new common_1.NotFoundException('Cliente no encontrado en esta empresa.');
            if (!reward)
                throw new common_1.NotFoundException('Recompensa no encontrada en esta empresa.');
            const unlockedReward = await transactionalEntityManager.findOne(unlocked_reward_entity_1.UnlockedReward, {
                where: { client: { id: dto.clientId }, reward: { id: dto.rewardId }, empresa_id: empresaId },
                relations: ['strategy'],
            });
            const redemptionData = { client, reward, user: { id: actor.userId }, empresa_id: empresaId };
            if (unlockedReward) {
                this.logger.log(`Procesando canje 'claim' para cliente ${dto.clientId} en empresa ${empresaId}`);
                redemptionData.points_used = 0;
                redemptionData.strategy = unlockedReward.strategy;
                await transactionalEntityManager.remove(unlockedReward);
            }
            else {
                this.logger.log(`Procesando canje 'points purchase' para cliente ${dto.clientId} en empresa ${empresaId}`);
                const pointsResult = await transactionalEntityManager.createQueryBuilder(points_transaction_entity_1.PointsTransaction, 'tx')
                    .select('SUM(tx.points_change)', 'total')
                    .where('"clientId" = :clientId', { clientId: client.id })
                    .andWhere('tx.empresa_id = :empresaId', { empresaId })
                    .getRawOne();
                const totalPoints = parseInt(pointsResult.total, 10) || 0;
                if (totalPoints < reward.cost_in_points) {
                    throw new common_1.BadRequestException('El cliente no tiene suficientes puntos.');
                }
                const pointsDeduction = transactionalEntityManager.create(points_transaction_entity_1.PointsTransaction, {
                    client,
                    points_change: -reward.cost_in_points,
                    reason: `Canje de recompensa: ${reward.name}`,
                    empresa_id: empresaId,
                });
                await transactionalEntityManager.save(pointsDeduction);
                this.logger.log(`Puntos deducidos exitosamente.`);
                redemptionData.points_used = reward.cost_in_points;
            }
            if (reward.stock !== -1) {
                if (reward.stock < 1)
                    throw new common_1.BadRequestException('Recompensa sin stock.');
                await transactionalEntityManager.decrement(reward_entity_1.Reward, { id: reward.id, empresa_id: empresaId }, 'stock', 1);
            }
            const redemption = transactionalEntityManager.create(redemption_entity_1.Redemption, redemptionData);
            return transactionalEntityManager.save(redemption);
        });
        const finalClientState = await this.clientsService.findOne(dto.clientId, actor);
        const finalRewardState = await this.rewardsService.findOne(dto.rewardId, actor);
        const newTotalPoints = (await this.clientsService.getClientSummary(finalClientState.document_id, actor)).total_points;
        await this.whatsappService.sendRedemptionNotification(finalClientState, finalRewardState, newTotalPoints);
        return savedRedemption;
    }
};
exports.RedemptionsService = RedemptionsService;
exports.RedemptionsService = RedemptionsService = RedemptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        clients_service_1.ClientsService,
        rewards_service_1.RewardsService,
        whatsapp_service_1.WhatsappService])
], RedemptionsService);
//# sourceMappingURL=redemptions.service.js.map