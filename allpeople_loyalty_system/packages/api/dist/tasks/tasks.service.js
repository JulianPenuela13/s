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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const points_transaction_entity_1 = require("../loyalty-engine/points-transaction.entity");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
const client_entity_1 = require("../clients/client.entity");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
let TasksService = TasksService_1 = class TasksService {
    pointsRepo;
    strategyRepo;
    clientRepo;
    empresaRepo;
    whatsappService;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(pointsRepo, strategyRepo, clientRepo, empresaRepo, whatsappService) {
        this.pointsRepo = pointsRepo;
        this.strategyRepo = strategyRepo;
        this.clientRepo = clientRepo;
        this.empresaRepo = empresaRepo;
        this.whatsappService = whatsappService;
    }
    async handlePointsExpiration() {
        this.logger.log('Running daily check for points expiration for all companies...');
        const empresas = await this.empresaRepo.find({ where: { estado_suscripcion: 'activa' } });
        for (const empresa of empresas) {
            this.logger.log(`Processing expiration for empresa #${empresa.id}`);
            const pointsStrategy = await this.strategyRepo.findOneBy({ key: 'points', empresa_id: empresa.id });
            if (!pointsStrategy?.settings?.expiration_enabled) {
                this.logger.log(`Points expiration is disabled for empresa #${empresa.id}. Skipping.`);
                continue;
            }
            const notificationDays = pointsStrategy.settings.notification_days_before;
            await this.invalidateExpiredPoints(empresa.id);
            if (notificationDays > 0) {
                await this.notifyUpcomingExpirations(notificationDays, empresa.id);
            }
        }
        this.logger.log('Daily points expiration check finished.');
    }
    async handleBirthdayCampaign() {
        this.logger.log('Running daily check for birthday campaigns for all companies...');
        const empresas = await this.empresaRepo.find({ where: { estado_suscripcion: 'activa' } });
        for (const empresa of empresas) {
            const birthdayStrategy = await this.strategyRepo.findOneBy({ key: 'birthday', is_active: true, empresa_id: empresa.id });
            if (!birthdayStrategy) {
                continue;
            }
            const { notification_days_before, message_template } = birthdayStrategy.settings;
            if (notification_days_before === undefined || !message_template) {
                this.logger.warn(`Birthday campaign for empresa #${empresa.id} is active but not configured correctly.`);
                continue;
            }
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + notification_days_before);
            const birthdayClients = await this.clientRepo.find({
                where: {
                    empresa_id: empresa.id,
                    birth_date: (0, typeorm_2.Raw)(alias => `EXTRACT(MONTH FROM ${alias}) = :month AND EXTRACT(DAY FROM ${alias}) = :day`, {
                        month: targetDate.getMonth() + 1,
                        day: targetDate.getDate(),
                    }),
                },
            });
            this.logger.log(`Found ${birthdayClients.length} clients for empresa #${empresa.id} with upcoming birthdays.`);
            for (const client of birthdayClients) {
                await this.whatsappService.sendBirthdayMessage(client, message_template);
            }
        }
    }
    async invalidateExpiredPoints(empresaId) {
        const now = new Date();
        const expiredTransactions = await this.pointsRepo.find({
            where: {
                empresa_id: empresaId,
                expires_at: (0, typeorm_2.LessThan)(now),
                points_change: (0, typeorm_2.MoreThan)(0),
            },
            relations: ['client'],
        });
        for (const tx of expiredTransactions) {
            const invalidationTx = this.pointsRepo.create({
                client: tx.client,
                points_change: -tx.points_change,
                reason: `Vencimiento de puntos ganados el ${tx.created_at.toISOString().split('T')[0]}`,
                expires_at: null,
                empresa_id: empresaId,
            });
            await this.pointsRepo.save(invalidationTx);
            tx.expires_at = null;
            await this.pointsRepo.save(tx);
        }
    }
    async notifyUpcomingExpirations(notificationDays, empresaId) {
        const today = new Date();
        const notificationDate = new Date();
        notificationDate.setDate(today.getDate() + notificationDays);
        const expiringSoonTxs = await this.pointsRepo.find({
            where: {
                empresa_id: empresaId,
                expires_at: (0, typeorm_2.Between)(today, notificationDate),
                points_change: (0, typeorm_2.MoreThan)(0),
            },
            relations: ['client'],
        });
        const notificationsToSend = new Map();
        for (const tx of expiringSoonTxs) {
        }
        for (const [, data] of notificationsToSend.entries()) {
            await this.whatsappService.sendPointsExpirationWarning(data.client, data.totalPoints, notificationDays);
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_1AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handlePointsExpiration", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleBirthdayCampaign", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(points_transaction_entity_1.PointsTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __param(2, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(3, (0, typeorm_1.InjectRepository)(empresa_entity_1.Empresa)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        whatsapp_service_1.WhatsappService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map