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
var NotificationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const client_entity_1 = require("../clients/client.entity");
const whatsapp_service_1 = require("./whatsapp.service");
let NotificationListener = NotificationListener_1 = class NotificationListener {
    whatsappService;
    logger = new common_1.Logger(NotificationListener_1.name);
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async handlePurchaseProcessedEvent(payload) {
        this.logger.log(`Event 'purchase.processed' received for client ${payload.client.id}. Sending WhatsApp notification...`);
        await this.whatsappService.sendPostPurchaseNotification(payload.client, payload.benefits, payload.newTotalPoints);
    }
    async handleClientCreatedEvent(client) {
        this.logger.log(`New client created event received for: ${client.full_name}`);
        try {
            await this.whatsappService.sendWelcomeMessage(client);
        }
        catch (error) {
            this.logger.error(`Failed to send welcome message to ${client.full_name}`, error);
        }
    }
};
exports.NotificationListener = NotificationListener;
__decorate([
    (0, event_emitter_1.OnEvent)('purchase.processed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationListener.prototype, "handlePurchaseProcessedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('client.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [client_entity_1.Client]),
    __metadata("design:returntype", Promise)
], NotificationListener.prototype, "handleClientCreatedEvent", null);
exports.NotificationListener = NotificationListener = NotificationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], NotificationListener);
//# sourceMappingURL=notification.listener.js.map