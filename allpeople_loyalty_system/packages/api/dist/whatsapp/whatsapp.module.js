"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const whatsapp_service_1 = require("./whatsapp.service");
const whatsapp_controller_1 = require("./whatsapp.controller");
const clients_module_1 = require("../clients/clients.module");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
const notification_listener_1 = require("./notification.listener");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
let WhatsappModule = class WhatsappModule {
};
exports.WhatsappModule = WhatsappModule;
exports.WhatsappModule = WhatsappModule = __decorate([
    (0, common_1.Module)({
        imports: [
            clients_module_1.ClientsModule,
            typeorm_1.TypeOrmModule.forFeature([loyalty_strategy_entity_1.LoyaltyStrategy, empresa_entity_1.Empresa]),
        ],
        controllers: [whatsapp_controller_1.WhatsappController],
        providers: [whatsapp_service_1.WhatsappService, notification_listener_1.NotificationListener],
        exports: [whatsapp_service_1.WhatsappService],
    })
], WhatsappModule);
//# sourceMappingURL=whatsapp.module.js.map