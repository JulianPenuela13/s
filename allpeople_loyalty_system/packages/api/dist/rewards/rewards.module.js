"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reward_entity_1 = require("./reward.entity");
const redemption_entity_1 = require("../redemptions/redemption.entity");
const rewards_service_1 = require("./rewards.service");
const rewards_controller_1 = require("./rewards.controller");
const unlocked_reward_entity_1 = require("./unlocked-reward.entity");
const audit_module_1 = require("../audit/audit.module");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
let RewardsModule = class RewardsModule {
};
exports.RewardsModule = RewardsModule;
exports.RewardsModule = RewardsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([reward_entity_1.Reward, redemption_entity_1.Redemption, unlocked_reward_entity_1.UnlockedReward, loyalty_strategy_entity_1.LoyaltyStrategy]), audit_module_1.AuditModule,],
        providers: [rewards_service_1.RewardsService],
        controllers: [rewards_controller_1.RewardsController],
        exports: [rewards_service_1.RewardsService],
    })
], RewardsModule);
//# sourceMappingURL=rewards.module.js.map