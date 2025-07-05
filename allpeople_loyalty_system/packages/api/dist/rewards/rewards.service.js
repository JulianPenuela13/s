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
let RewardsService = class RewardsService {
    rewardsRepository;
    constructor(rewardsRepository) {
        this.rewardsRepository = rewardsRepository;
    }
    async create(createRewardDto, empresaId) {
        const newReward = this.rewardsRepository.create({
            ...createRewardDto,
            empresa_id: empresaId,
        });
        return this.rewardsRepository.save(newReward);
    }
    async findAll(empresaId) {
        return this.rewardsRepository.find({
            where: { empresa_id: empresaId },
        });
    }
    async findOne(id, empresaId) {
        const reward = await this.rewardsRepository.findOne({ where: { id, empresa_id: empresaId } });
        if (!reward) {
            throw new common_1.NotFoundException(`Recompensa con ID "${id}" no encontrada.`);
        }
        return reward;
    }
    async update(id, updateRewardDto, empresaId) {
        const reward = await this.findOne(id, empresaId);
        const updatedReward = this.rewardsRepository.merge(reward, updateRewardDto);
        return this.rewardsRepository.save(updatedReward);
    }
    async remove(id, empresaId) {
        const result = await this.rewardsRepository.delete({ id, empresa_id: empresaId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Recompensa con ID "${id}" no encontrada.`);
        }
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reward_entity_1.Reward)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map