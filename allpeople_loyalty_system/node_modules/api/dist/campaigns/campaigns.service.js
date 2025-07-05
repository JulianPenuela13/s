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
var CampaignsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
const client_entity_1 = require("../clients/client.entity");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let CampaignsService = CampaignsService_1 = class CampaignsService {
    strategyRepo;
    clientRepo;
    whatsappService;
    logger = new common_1.Logger(CampaignsService_1.name);
    constructor(strategyRepo, clientRepo, whatsappService) {
        this.strategyRepo = strategyRepo;
        this.clientRepo = clientRepo;
        this.whatsappService = whatsappService;
    }
    async announcePointsCampaign() {
        const campaign = await this.strategyRepo.findOneBy({ key: 'campaigns', is_active: true });
        if (!campaign) {
            throw new common_1.NotFoundException('No hay una campaña de puntos múltiples activa para anunciar.');
        }
        const allClients = await this.clientRepo.find();
        this.logger.log(`Found ${allClients.length} clients to notify about the campaign.`);
        this.sendNotificationsInBackground(allClients, campaign.settings);
        return { message: `El anuncio de la campaña ha sido enviado a la cola para ${allClients.length} clientes.` };
    }
    async sendNotificationsInBackground(clients, settings) {
        for (const client of clients) {
            try {
                await this.whatsappService.sendCampaignAnnouncementMessage(client, settings);
            }
            catch (error) {
                this.logger.error(`Failed to send campaign announcement to client ${client.id}`, error);
            }
        }
        this.logger.log('Finished sending all campaign announcements.');
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = CampaignsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __param(1, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        whatsapp_service_1.WhatsappService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map