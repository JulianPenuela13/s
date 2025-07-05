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
exports.RedemptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redemption_entity_1 = require("./redemption.entity");
const clients_service_1 = require("../clients/clients.service");
const rewards_service_1 = require("../rewards/rewards.service");
let RedemptionsService = class RedemptionsService {
    redemptionsRepository;
    clientsService;
    rewardsService;
    constructor(redemptionsRepository, clientsService, rewardsService) {
        this.redemptionsRepository = redemptionsRepository;
        this.clientsService = clientsService;
        this.rewardsService = rewardsService;
    }
    async create(createRedemptionDto, empresaId) {
        const { clientId, rewardId } = createRedemptionDto;
        const client = await this.clientsService.findOne(clientId, empresaId);
        const reward = await this.rewardsService.findOne(rewardId, empresaId);
        if (client.points_balance < reward.points_cost) {
            throw new common_1.BadRequestException('El cliente no tiene puntos suficientes para canjear esta recompensa.');
        }
        const newBalance = client.points_balance - reward.points_cost;
        await this.clientsService.update(clientId, { points_balance: newBalance }, empresaId);
        const newRedemption = this.redemptionsRepository.create({
            client: { id: clientId },
            reward: { id: rewardId },
            empresa: { id: empresaId },
        });
        return this.redemptionsRepository.save(newRedemption);
    }
    async findAll(empresaId) {
        return this.redemptionsRepository.find({
            where: { empresa_id: empresaId },
            relations: ['client', 'reward'],
        });
    }
    async findOne(id, empresaId) {
        const redemption = await this.redemptionsRepository.findOne({
            where: { id, empresa_id: empresaId },
            relations: ['client', 'reward'],
        });
        if (!redemption) {
            throw new common_1.NotFoundException(`Canje con ID "${id}" no encontrado.`);
        }
        return redemption;
    }
};
exports.RedemptionsService = RedemptionsService;
exports.RedemptionsService = RedemptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(redemption_entity_1.Redemption)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        clients_service_1.ClientsService,
        rewards_service_1.RewardsService])
], RedemptionsService);
//# sourceMappingURL=redemptions.service.js.map