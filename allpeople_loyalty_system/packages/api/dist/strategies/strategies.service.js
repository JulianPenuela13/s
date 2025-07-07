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
exports.StrategiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../audit/audit-log.entity");
const audit_service_1 = require("../audit/audit.service");
let StrategiesService = class StrategiesService {
    strategyRepository;
    auditLogRepository;
    auditService;
    constructor(strategyRepository, auditLogRepository, auditService) {
        this.strategyRepository = strategyRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditService = auditService;
    }
    getStrategies(actor) {
        return this.strategyRepository.find({
            where: { empresa_id: actor.empresaId },
            order: { name: 'ASC' },
        });
    }
    async findAll(actor) {
        return this.strategyRepository.find({
            where: { empresa_id: actor.empresaId },
            order: { id: 'ASC' },
        });
    }
    async findOne(id, actor) {
        const strategy = await this.strategyRepository.findOneBy({ id: id, empresa_id: actor.empresaId });
        if (!strategy) {
            throw new common_1.NotFoundException(`Estrategia con ID ${id} no encontrada en su empresa.`);
        }
        return strategy;
    }
    async toggleStrategy(id, isActive, actor) {
        const strategy = await this.findOne(id, actor);
        await this.strategyRepository.update(id, { is_active: isActive });
        await this.auditService.logAction(actor, 'STRATEGY_TOGGLE', {
            strategyName: strategy.name,
            isActive,
        });
        return { success: true, newState: isActive };
    }
    async updateStrategySettings(id, updateDto, actor) {
        const empresaId = actor.empresaId;
        const strategy = await this.strategyRepository.findOneBy({ id, empresa_id: empresaId });
        if (!strategy) {
            throw new common_1.NotFoundException(`Estrategia con ID ${id} no encontrada en su empresa.`);
        }
        const newSettings = { ...strategy.settings, ...updateDto.settings };
        await this.strategyRepository.update({ id, empresa_id: empresaId }, { settings: newSettings });
        await this.auditService.logAction(actor, 'STRATEGY_SETTINGS_UPDATE', {
            strategyName: strategy.name,
            newSettings,
        });
        return { success: true };
    }
    getAuditLogs(actor) {
        return this.auditLogRepository.find({
            where: { empresa_id: actor.empresaId },
            relations: ['user'],
            order: { created_at: 'DESC' },
            take: 100,
        });
    }
};
exports.StrategiesService = StrategiesService;
exports.StrategiesService = StrategiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], StrategiesService);
//# sourceMappingURL=strategies.service.js.map