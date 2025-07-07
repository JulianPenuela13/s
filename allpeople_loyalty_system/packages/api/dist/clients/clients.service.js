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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_entity_1 = require("./client.entity");
const points_transaction_entity_1 = require("../loyalty-engine/points-transaction.entity");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
const client_progress_entity_1 = require("../loyalty-engine/client-progress.entity");
const unlocked_reward_entity_1 = require("../rewards/unlocked-reward.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
let ClientsService = class ClientsService {
    clientsRepository;
    pointsRepository;
    strategyRepository;
    progressRepository;
    unlockedRewardRepo;
    eventEmitter;
    constructor(clientsRepository, pointsRepository, strategyRepository, progressRepository, unlockedRewardRepo, eventEmitter) {
        this.clientsRepository = clientsRepository;
        this.pointsRepository = pointsRepository;
        this.strategyRepository = strategyRepository;
        this.progressRepository = progressRepository;
        this.unlockedRewardRepo = unlockedRewardRepo;
        this.eventEmitter = eventEmitter;
    }
    async create(createClientDto, actor) {
        const empresaId = actor.empresaId;
        const { document_id, phone_number } = createClientDto;
        const existingClient = await this.clientsRepository.findOne({
            where: [
                { document_id, empresa_id: empresaId },
                { phone_number, empresa_id: empresaId },
            ],
        });
        if (existingClient) {
            throw new common_1.ConflictException('Ya existe un cliente con el mismo documento o teléfono en su empresa.');
        }
        if (createClientDto.phone_number) {
            createClientDto.phone_number = String(createClientDto.phone_number).replace(/\D/g, '');
        }
        const newClient = this.clientsRepository.create({
            ...createClientDto,
            empresa_id: empresaId,
        });
        const savedClient = await this.clientsRepository.save(newClient);
        this.eventEmitter.emit('client.created', savedClient);
        return savedClient;
    }
    async findOne(id, actor) {
        const client = await this.clientsRepository.findOneBy({ id: id, empresa_id: actor.empresaId });
        if (!client) {
            throw new common_1.NotFoundException(`Cliente con ID "${id}" no encontrado en su empresa.`);
        }
        return client;
    }
    async getClientSummary(documentId, actor) {
        const client = await this.clientsRepository.findOneBy({ document_id: documentId, empresa_id: actor.empresaId });
        if (!client) {
            throw new common_1.NotFoundException(`Cliente con cédula ${documentId} no encontrado en su empresa.`);
        }
        const pointsResult = await this.pointsRepository
            .createQueryBuilder('tx')
            .select('SUM(tx.points_change)', 'total_points')
            .where('tx.clientId = :clientId', { clientId: client.id })
            .andWhere('tx.empresa_id = :empresaId', { empresaId: actor.empresaId })
            .getRawOne();
        const totalPoints = parseInt(pointsResult?.total_points, 10) || 0;
        return {
            ...client,
            total_points: totalPoints,
        };
    }
    async findOneByPhone(phone, actor) {
        return this.clientsRepository.findOneBy({ phone_number: phone, empresa_id: actor.empresaId });
    }
    async getClientProgressSummary(clientId, actor) {
        await this.findOne(clientId, actor);
        const empresaId = actor.empresaId;
        const purchaseCountStrategies = await this.strategyRepository
            .createQueryBuilder('strategy')
            .where('strategy.is_active = :isActive', { isActive: true })
            .andWhere('strategy.empresa_id = :empresaId', { empresaId })
            .andWhere("(strategy.settings ->> 'required_purchases' IS NOT NULL OR strategy.settings ->> 'trigger_on_purchase_count' IS NOT NULL)")
            .getMany();
        if (purchaseCountStrategies.length === 0) {
            return [];
        }
        const clientProgress = await this.progressRepository.find({
            where: {
                client: { id: clientId },
                strategy: { id: (0, typeorm_2.In)(purchaseCountStrategies.map(s => s.id)) },
                empresa_id: empresaId,
            },
            relations: ['strategy'],
        });
        return purchaseCountStrategies.map(strategy => {
            const progress = clientProgress.find(p => p.strategy?.id === strategy.id);
            return {
                strategy_name: strategy.name,
                current_step: progress ? progress.progress_value : 0,
                target_step: strategy.settings.required_purchases || strategy.settings.trigger_on_purchase_count,
            };
        });
    }
    async getUnlockedRewards(clientId, actor) {
        await this.findOne(clientId, actor);
        return this.unlockedRewardRepo.find({
            where: {
                client: { id: clientId },
                empresa_id: actor.empresaId,
            },
            relations: ['reward'],
        });
    }
    async findOneByDocument(documentId, actor) {
        return this.clientsRepository.findOneBy({ document_id: documentId, empresa_id: actor.empresaId });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(1, (0, typeorm_1.InjectRepository)(points_transaction_entity_1.PointsTransaction)),
    __param(2, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __param(3, (0, typeorm_1.InjectRepository)(client_progress_entity_1.ClientProgress)),
    __param(4, (0, typeorm_1.InjectRepository)(unlocked_reward_entity_1.UnlockedReward)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], ClientsService);
//# sourceMappingURL=clients.service.js.map