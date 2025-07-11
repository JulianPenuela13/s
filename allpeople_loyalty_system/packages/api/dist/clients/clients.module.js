"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const client_entity_1 = require("./client.entity");
const clients_service_1 = require("./clients.service");
const points_transaction_entity_1 = require("../loyalty-engine/points-transaction.entity");
const clients_controller_1 = require("./clients.controller");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
const client_progress_entity_1 = require("../loyalty-engine/client-progress.entity");
const unlocked_reward_entity_1 = require("../rewards/unlocked-reward.entity");
let ClientsModule = class ClientsModule {
};
exports.ClientsModule = ClientsModule;
exports.ClientsModule = ClientsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([client_entity_1.Client, points_transaction_entity_1.PointsTransaction, loyalty_strategy_entity_1.LoyaltyStrategy, client_progress_entity_1.ClientProgress, unlocked_reward_entity_1.UnlockedReward,])],
        providers: [clients_service_1.ClientsService],
        controllers: [clients_controller_1.ClientsController],
        exports: [clients_service_1.ClientsService],
    })
], ClientsModule);
//# sourceMappingURL=clients.module.js.map