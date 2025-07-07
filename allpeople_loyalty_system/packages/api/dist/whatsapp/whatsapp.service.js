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
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
const axios_1 = require("axios");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    configService;
    strategyRepository;
    empresaRepository;
    twilioClient;
    logger = new common_1.Logger(WhatsappService_1.name);
    constructor(configService, strategyRepository, empresaRepository) {
        this.configService = configService;
        this.strategyRepository = strategyRepository;
        this.empresaRepository = empresaRepository;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        if (accountSid && authToken) {
            this.twilioClient = new twilio_1.Twilio(accountSid, authToken);
        }
        else {
            this.logger.warn('Las credenciales de Twilio no están configuradas. Los mensajes vía Twilio estarán deshabilitados.');
        }
    }
    async sendMessage(client, body) {
        if (!client || !client.empresa_id) {
            this.logger.error(`Intento de enviar mensaje a un cliente sin empresa_id: ${client.id}`);
            return;
        }
        const empresa = await this.empresaRepository.findOneBy({ id: client.empresa_id });
        if (!empresa) {
            this.logger.error(`No se encontró la empresa con ID ${client.empresa_id} para el cliente ${client.id}`);
            return;
        }
        switch (empresa.whatsapp_provider) {
            case empresa_entity_1.WhatsappProvider.TWILIO:
                await this._sendWithTwilio(client.phone_number, body, empresa.twilio_phone_number);
                break;
            case empresa_entity_1.WhatsappProvider.WPPCONNECT:
                await this._sendWithWPPConnect(client.phone_number, body, empresa.wpp_session_name);
                break;
            default:
                this.logger.log(`WhatsApp está desactivado para la empresa #${empresa.id}. No se envió mensaje a ${client.phone_number}.`);
                break;
        }
    }
    async _sendWithTwilio(to, body, from) {
        if (!this.twilioClient) {
            this.logger.error(`Se intentó enviar con Twilio, pero el cliente no está inicializado.`);
            return;
        }
        if (!from) {
            this.logger.error(`La empresa no tiene un número de Twilio configurado. Mensaje no enviado a ${to}.`);
            return;
        }
        try {
            await this.twilioClient.messages.create({
                from: `whatsapp:${from}`,
                to: `whatsapp:${to}`,
                body,
            });
            this.logger.log(`Mensaje enviado a ${to} vía Twilio desde ${from}.`);
        }
        catch (error) {
            this.logger.error(`Error enviando mensaje con Twilio a ${to}: ${error.message}`);
        }
    }
    async _sendWithWPPConnect(to, body, sessionName) {
        if (!sessionName) {
            this.logger.error(`La empresa no tiene una sesión de WPPConnect configurada. Mensaje no enviado a ${to}.`);
            return;
        }
        const wppServerUrl = this.configService.get('WPP_SERVER_URL', 'http://localhost:21465');
        try {
            await axios_1.default.post(`${wppServerUrl}/api/${sessionName}/send-message`, {
                phone: to,
                message: body,
            });
            this.logger.log(`Mensaje enviado a ${to} vía WPPConnect (sesión: ${sessionName}).`);
        }
        catch (error) {
            this.logger.error(`Error enviando mensaje con WPPConnect a ${to}: ${error.response?.data?.message || error.message}`);
        }
    }
    async sendWelcomeMessage(client) {
        if (!client.phone_number)
            return;
        const empresaId = client.empresa_id;
        const activeStrategies = await this.strategyRepository.findBy({ is_active: true, empresa_id: empresaId });
        const activeKeys = activeStrategies.map(s => s.key);
        const clientFirstName = client.full_name.split(' ')[0];
        let body = `¡Hola ${clientFirstName}! 👋 Bienvenido al programa de lealtad. ¡Ya estás acumulando beneficios con cada compra!\n\nEstos son los comandos que puedes usar:`;
        if (activeKeys.includes('points')) {
            body += `\n- Envía *puntos* para consultar tu saldo.`;
        }
        if (activeKeys.some(key => ['frequency', 'random_prizes', 'secret_rewards'].includes(key))) {
            body += `\n- Envía *progreso* para ver tu avance.`;
        }
        await this.sendMessage(client, body);
    }
    async sendPostPurchaseNotification(client, benefits, newTotalPoints) {
        if (!client.phone_number)
            return;
        const empresaId = client.empresa_id;
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
        if (directBenefits.length === 0 && progressText === '')
            return;
        const clientFirstName = client.full_name.split(' ')[0];
        let body = `¡Hola ${clientFirstName}! Gracias por tu compra.`;
        if (directBenefits.length > 0) {
            body += ` Acabas de ganar ${directBenefits.join(' y ')}.`;
        }
        body += progressText;
        const pointsStrategy = await this.strategyRepository.findOneBy({ key: 'points', is_active: true, empresa_id: empresaId });
        if (pointsStrategy) {
            body += `\n\nTu saldo de puntos es de *${newTotalPoints}*.`;
        }
        body += `\n\n¡Gracias por tu lealtad!`;
        await this.sendMessage(client, body);
    }
    async sendRedemptionNotification(client, reward, newTotalPoints) {
        if (!client.phone_number)
            return;
        const clientFirstName = client.full_name.split(' ')[0];
        const body = `¡Hola ${clientFirstName}! Has canjeado con éxito tu recompensa: *${reward.name}*. ✨\n\nTu nuevo saldo es de *${newTotalPoints}* puntos. ¡Disfrútala!`;
        await this.sendMessage(client, body);
    }
    async sendPointsExpirationWarning(client, pointsToExpire, days) {
        if (!client.phone_number)
            return;
        const clientFirstName = client.full_name.split(' ')[0];
        const body = `¡Hola ${clientFirstName}! ⏰ Ojo, tienes *${pointsToExpire}* puntos que vencerán en los próximos *${days} días*. ¡No dejes que se pierdan, canjéalos por premios increíbles!`;
        await this.sendMessage(client, body);
    }
    async sendBirthdayMessage(client, messageTemplate) {
        if (!client.phone_number)
            return;
        const clientFirstName = client.full_name.split(' ')[0];
        const body = messageTemplate.replace(/\[NOMBRE\]/g, clientFirstName);
        await this.sendMessage(client, body);
    }
    async sendCampaignAnnouncementMessage(client, settings) {
        if (!client.phone_number)
            return;
        const clientFirstName = client.full_name.split(' ')[0];
        const startDate = new Date(settings.start_date).toLocaleDateString('es-CO');
        const endDate = new Date(settings.end_date).toLocaleDateString('es-CO');
        const body = `¡Hola ${clientFirstName}! ✨ ¡Tenemos noticias increíbles! Del ${startDate} al ${endDate}, todas tus compras te darán *x${settings.multiplier} PUNTOS*. ¡No te pierdas esta oportunidad única para acumular más y ganar premios! 🚀`;
        await this.sendMessage(client, body);
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __param(2, (0, typeorm_1.InjectRepository)(empresa_entity_1.Empresa)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map