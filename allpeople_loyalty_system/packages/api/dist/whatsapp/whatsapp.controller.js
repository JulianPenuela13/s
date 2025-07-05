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
var WhatsappController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const twilio_service_1 = require("../twilio/twilio.service");
const clients_service_1 = require("../clients/clients.service");
const rewards_service_1 = require("../rewards/rewards.service");
let WhatsappController = WhatsappController_1 = class WhatsappController {
    twilioService;
    clientsService;
    rewardsService;
    logger = new common_1.Logger(WhatsappController_1.name);
    constructor(twilioService, clientsService, rewardsService) {
        this.twilioService = twilioService;
        this.clientsService = clientsService;
        this.rewardsService = rewardsService;
    }
    async handleIncomingMessage(body) {
        const fromNumber = body.From.replace('whatsapp:', '');
        const message = body.Body.toLowerCase().trim();
        this.logger.log(`Mensaje recibido de ${fromNumber}: "${message}"`);
        const client = await this.clientsService.findOneByPhoneAcrossTenants(fromNumber);
        if (!client) {
            this.logger.log(`Cliente no encontrado para el número ${fromNumber}.`);
            await this.twilioService.sendWhatsappMessage(fromNumber, 'Hola! No te encontramos en nuestro sistema. Por favor, regístrate en una de nuestras tiendas.');
            return;
        }
        const empresaId = client.empresa_id;
        if (message === 'puntos') {
            const summary = `Hola ${client.full_name}! Tienes ${client.points_balance} puntos acumulados.`;
            await this.twilioService.sendWhatsappMessage(fromNumber, summary);
        }
        else if (message === 'recompensas') {
            const rewards = await this.rewardsService.findAll(empresaId);
            let rewardsMessage = 'Recompensas Disponibles:\n\n';
            if (rewards.length > 0) {
                rewards.forEach(r => {
                    rewardsMessage += `🎁 ${r.name}\nCosto: ${r.points_cost} puntos\n\n`;
                });
            }
            else {
                rewardsMessage = 'Actualmente no hay recompensas disponibles en tu programa.';
            }
            await this.twilioService.sendWhatsappMessage(fromNumber, rewardsMessage);
        }
        else {
            const defaultMessage = `Hola ${client.full_name}!\n\nEnvía *puntos* para ver tu saldo.\nEnvía *recompensas* para ver los premios disponibles.`;
            await this.twilioService.sendWhatsappMessage(fromNumber, defaultMessage);
        }
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Post)('inbound'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "handleIncomingMessage", null);
exports.WhatsappController = WhatsappController = WhatsappController_1 = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [twilio_service_1.TwilioService,
        clients_service_1.ClientsService,
        rewards_service_1.RewardsService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map