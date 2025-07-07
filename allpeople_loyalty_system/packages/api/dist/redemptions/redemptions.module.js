"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedemptionsModule = void 0;
const common_1 = require("@nestjs/common");
const redemptions_service_1 = require("./redemptions.service");
const redemptions_controller_1 = require("./redemptions.controller");
const typeorm_1 = require("@nestjs/typeorm");
const redemption_entity_1 = require("../rewards/redemption.entity");
const unlocked_reward_entity_1 = require("../rewards/unlocked-reward.entity");
const points_transaction_entity_1 = require("../loyalty-engine/points-transaction.entity");
const clients_module_1 = require("../clients/clients.module");
const rewards_module_1 = require("../rewards/rewards.module");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
let RedemptionsModule = class RedemptionsModule {
};
exports.RedemptionsModule = RedemptionsModule;
exports.RedemptionsModule = RedemptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([redemption_entity_1.Redemption, unlocked_reward_entity_1.UnlockedReward, points_transaction_entity_1.PointsTransaction]),
            clients_module_1.ClientsModule,
            rewards_module_1.RewardsModule,
            whatsapp_module_1.WhatsappModule,
        ],
        controllers: [redemptions_controller_1.RedemptionsController],
        providers: [redemptions_service_1.RedemptionsService],
    })
], RedemptionsModule);
//# sourceMappingURL=redemptions.module.js.map