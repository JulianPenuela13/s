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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const twilio_1 = require("twilio");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    configService;
    strategyRepository;
    twilioClient;
    logger = new common_1.Logger(WhatsappService_1.name);
    constructor(configService, strategyRepository) {
        this.configService = configService;
        this.strategyRepository = strategyRepository;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        if (!accountSid || !authToken) {
            this.logger.error('Twilio credentials are not configured. WhatsApp messages will not be sent.');
            return;
        }
        this.twilioClient = new twilio_1.Twilio(accountSid, authToken);
    }
    async sendPostPurchaseNotification(client, benefits, newTotalPoints) {
        if (!client.phone_number)
            return;
        const directBenefits = [];
        if (benefits.points_earned > 0) {
            directBenefits.push(`*${benefits.points_earned}* puntos`);
        }
        if (benefits.cashback_earned > 0) {
            const cashbackFormatted = benefits.cashback_earned.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
            directBenefits.push(`*${cashbackFormatted}* de cashback`);
        }
        if (benefits.reward_unlocked) {
            directBenefits.push(`¡un premio sorpresa! 🎉`);
        }
        let progressText = '';
        if (benefits.progress_updates && benefits.progress_updates.length > 0) {
            progressText = '\n\n*Tu Progreso:*';
            benefits.progress_updates.forEach((update) => {
                progressText += `\n- ${update.strategy_name}: Ahora llevas *${update.progress_text}* compras.`;
            });
        }
        if (directBenefits.length === 0 && progressText === '') {
            this.logger.log('No new benefits or progress to notify for this purchase.');
            return;
        }
        const clientFirstName = client.full_name.split(' ')[0];
        let body = `¡Hola ${clientFirstName}! Tu compra en All People fue un éxito.`;
        if (directBenefits.length > 0) {
            body += ` Acabas de ganar ${directBenefits.join(' y ')}.`;
        }
        body += progressText;
        const pointsStrategy = await this.strategyRepository.findOneBy({ key: 'points', is_active: true });
        if (pointsStrategy) {
            body += `\n\nTu saldo de puntos es de *${newTotalPoints}*.`;
        }
        body += `\n\n¡Gracias por tu lealtad!`;
        const recipientNumber = `whatsapp:${client.phone_number}`;
        await this.sendMessage(recipientNumber, body);
    }
    async sendRedemptionNotification(client, reward, newTotalPoints) {
        if (!client.phone_number)
            return;
        const clientFirstName = client.full_name.split(' ')[0];
        const body = `¡Hola ${clientFirstName}! Has canjeado con éxito tu recompensa: *${reward.name}*. ✨\n\nTu nuevo saldo es de *${newTotalPoints}* puntos. ¡Disfrútala!`;
        const recipientNumber = `whatsapp:${client.phone_number}`;
        await this.sendMessage(recipientNumber, body);
    }
    async sendMessage(to, body) {
        if (!this.twilioClient) {
            this.logger.warn(`Skipping WhatsApp message to ${to} because Twilio client is not initialized.`);
            return;
        }
        const from = this.configService.get('TWILIO_WHATSAPP_NUMBER');
        try {
            await this.twilioClient.messages.create({ from, to, body });
            this.logger.log(`Message sent to ${to}`);
        }
        catch (error) {
            this.logger.error("Could not send WhatsApp message", error);
        }
    }
    async sendPointsExpirationWarning(client, pointsToExpire, days) {
        if (!client.phone_number)
            return;
        const clientFirstName = client.full_name.split(' ')[0];
        const body = `¡Hola ${clientFirstName}! ⏰ Ojo, tienes *${pointsToExpire}* puntos que vencerán en los próximos *${days} días*. ¡No dejes que se pierdan, canjéalos por premios increíbles en All People!`;
        const recipientNumber = `whatsapp:${client.phone_number}`;
        await this.sendMessage(recipientNumber, body);
    }
    async sendBirthdayMessage(client, messageTemplate) {
        if (!client.phone_number)
            return;
        const clientFirstName = client.full_name.split(' ')[0];
        const body = messageTemplate.replace(/\[NOMBRE\]/g, clientFirstName);
        this.logger.log(`Sending birthday message to ${client.full_name}`);
        const recipientNumber = `whatsapp:${client.phone_number}`;
        await this.sendMessage(recipientNumber, body);
    }
    async sendWelcomeMessage(client) {
        if (!client.phone_number)
            return;
        const activeStrategies = await this.strategyRepository.findBy({ is_active: true });
        const activeKeys = activeStrategies.map(s => s.key);
        const clientFirstName = client.full_name.split(' ')[0];
        let body = `¡Hola ${clientFirstName}! 👋 Bienvenido al programa de lealtad de All People. ¡Ya estás acumulando beneficios con cada compra!\n\nEstos son los comandos que puedes usar:`;
        if (activeKeys.includes('points')) {
            body += `\n- Envía *puntos* para consultar tu saldo.`;
        }
        if (activeKeys.includes('frequency') || activeKeys.includes('random_prizes')) {
            body += `\n- Envía *progreso* para ver cuánto te falta para tu próximo premio.`;
        }
        body += `\n- Envía *ayuda* si tienes alguna pregunta.`;
        body += `\n\n¡Estamos felices de tenerte!`;
        this.logger.log(`Sending welcome message to new client ${client.full_name}`);
        const recipientNumber = `whatsapp:${client.phone_number}`;
        await this.sendMessage(recipientNumber, body);
    }
    async sendCampaignAnnouncementMessage(client, settings) {
        if (!client.phone_number)
            return;
        const clientFirstName = client.full_name.split(' ')[0];
        const startDate = new Date(settings.start_date).toLocaleDateString('es-CO');
        const endDate = new Date(settings.end_date).toLocaleDateString('es-CO');
        const body = `¡Hola ${clientFirstName}! ✨ ¡Tenemos noticias increíbles! Del ${startDate} al ${endDate}, todas tus compras en All People te darán *x${settings.multiplier} PUNTOS*. ¡No te pierdas esta oportunidad única para acumular más y ganar premios! 🚀`;
        await this.sendMessage(`whatsapp:${client.phone_number}`, body);
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map