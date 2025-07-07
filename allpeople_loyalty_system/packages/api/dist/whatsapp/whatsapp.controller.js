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
const whatsapp_service_1 = require("./whatsapp.service");
const clients_service_1 = require("../clients/clients.service");
const typeorm_1 = require("@nestjs/typeorm");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
const typeorm_2 = require("typeorm");
let WhatsappController = WhatsappController_1 = class WhatsappController {
    whatsappService;
    clientsService;
    empresaRepository;
    logger = new common_1.Logger(WhatsappController_1.name);
    constructor(whatsappService, clientsService, empresaRepository) {
        this.whatsappService = whatsappService;
        this.clientsService = clientsService;
        this.empresaRepository = empresaRepository;
    }
    testEndpoint() {
        this.logger.log('¡El endpoint de prueba /whatsapp/test FUE LLAMADO CORRECTAMENTE!');
        return { success: true, message: 'La conexión ngrok -> NestJS funciona perfectamente.' };
    }
    async handleIncomingMessage(body, res) {
        const fromNumberWithPrefix = body.From || '';
        const toTwilioNumberWithPrefix = body.To || '';
        const messageBody = body.Body?.toLowerCase().trim() || '';
        const fromNumber = fromNumberWithPrefix.replace(/\D/g, '');
        const toTwilioNumber = toTwilioNumberWithPrefix.replace(/\D/g, '');
        this.logger.log(`Incoming message to Twilio# ${toTwilioNumber} from ${fromNumber}`);
        const empresa = await this.empresaRepository.findOneBy({ twilio_phone_number: toTwilioNumber });
        if (!empresa) {
            this.logger.error(`Mensaje recibido en un número de Twilio no asignado: ${toTwilioNumber}`);
            return res.status(200).send();
        }
        const actor = { empresaId: empresa.id, rol: 'SYSTEM', userId: 0 };
        const client = await this.clientsService.findOneByPhone(fromNumber, actor);
        if (!client) {
            this.logger.warn(`Cliente con teléfono ${fromNumber} no encontrado para la empresa #${empresa.id}`);
            await this.whatsappService.sendMessage(fromNumberWithPrefix, 'Hola! No te encontramos en nuestro sistema. Asegúrate de estar registrado con este número de WhatsApp.');
            return res.status(200).send();
        }
        const clientFirstName = client.full_name.split(' ')[0];
        if (messageBody === 'puntos' || messageBody === 'saldo') {
            const summary = await this.clientsService.getClientSummary(client.document_id, actor);
            const reply = `¡Hola ${clientFirstName}! Tu saldo actual es de *${summary.total_points}* puntos.`;
            await this.whatsappService.sendMessage(fromNumberWithPrefix, reply);
        }
        else if (messageBody === 'progreso') {
            const progressSummary = await this.clientsService.getClientProgressSummary(client.id, actor);
            if (!progressSummary || progressSummary.length === 0) {
                await this.whatsappService.sendMessage(fromNumberWithPrefix, `¡Hola ${clientFirstName}! Actualmente no estás participando en ninguna campaña de progreso por compras.`);
            }
            else {
                let reply = `¡Hola ${clientFirstName}! Este es tu progreso actual:\n`;
                progressSummary.forEach(p => {
                    reply += `\n- Para *${p.strategy_name}*, llevas *${p.current_step} de ${p.target_step}* compras.`;
                });
                await this.whatsappService.sendMessage(fromNumberWithPrefix, reply);
            }
        }
        else {
            const reply = `¡Hola ${clientFirstName}! Envía la palabra *puntos* para ver tu saldo o *progreso* para ver tu avance en nuestras campañas.`;
            await this.whatsappService.sendMessage(fromNumberWithPrefix, reply);
        }
        res.status(200).send();
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "testEndpoint", null);
__decorate([
    (0, common_1.Post)('incoming'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "handleIncomingMessage", null);
exports.WhatsappController = WhatsappController = WhatsappController_1 = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __param(2, (0, typeorm_1.InjectRepository)(empresa_entity_1.Empresa)),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        clients_service_1.ClientsService,
        typeorm_2.Repository])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map