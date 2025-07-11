"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tasks_service_1 = require("./tasks.service");
const tasks_controller_1 = require("./tasks.controller");
const points_transaction_entity_1 = require("../loyalty-engine/points-transaction.entity");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
const client_entity_1 = require("../clients/client.entity");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([points_transaction_entity_1.PointsTransaction, loyalty_strategy_entity_1.LoyaltyStrategy, client_entity_1.Client, empresa_entity_1.Empresa,]),
            whatsapp_module_1.WhatsappModule,
        ],
        controllers: [tasks_controller_1.TasksController],
        providers: [tasks_service_1.TasksService],
    })
], TasksModule);
//# sourceMappingURL=tasks.module.js.map