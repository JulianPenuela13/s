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
var TwilioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioService = void 0;
const common_1 = require("@nestjs/common");
const twilio_1 = require("twilio");
let TwilioService = TwilioService_1 = class TwilioService {
    logger = new common_1.Logger(TwilioService_1.name);
    client;
    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (!accountSid || !authToken) {
            this.logger.error('Las credenciales de Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) no están configuradas en el archivo .env');
            return;
        }
        this.client = new twilio_1.Twilio(accountSid, authToken);
    }
    async sendWhatsappMessage(to, body) {
        const from = process.env.TWILIO_WHATSAPP_NUMBER;
        if (!this.client) {
            this.logger.error('El cliente de Twilio no está inicializado. Verifica tus credenciales.');
            return;
        }
        try {
            await this.client.messages.create({
                from: `whatsapp:${from}`,
                to: `whatsapp:${to}`,
                body: body,
            });
            this.logger.log(`Mensaje de WhatsApp enviado a ${to}`);
        }
        catch (error) {
            this.logger.error(`Error al enviar mensaje de WhatsApp a ${to}:`, error);
        }
    }
};
exports.TwilioService = TwilioService;
exports.TwilioService = TwilioService = TwilioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TwilioService);
//# sourceMappingURL=twilio.service.js.map