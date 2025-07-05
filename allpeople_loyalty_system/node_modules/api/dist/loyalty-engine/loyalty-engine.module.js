"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyEngineModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const loyalty_engine_service_1 = require("./loyalty-engine.service");
const rule_entity_1 = require("../rules/rule.entity");
const reward_entity_1 = require("../rewards/reward.entity");
const unlocked_reward_entity_1 = require("../unlocked-rewards/unlocked-reward.entity");
const points_transaction_entity_1 = require("../points/points-transaction.entity");
let LoyaltyEngineModule = class LoyaltyEngineModule {
};
exports.LoyaltyEngineModule = LoyaltyEngineModule;
exports.LoyaltyEngineModule = LoyaltyEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                rule_entity_1.Rule,
                reward_entity_1.Reward,
                unlocked_reward_entity_1.UnlockedReward,
                points_transaction_entity_1.PointsTransaction,
            ]),
        ],
        providers: [loyalty_engine_service_1.LoyaltyEngineService],
        exports: [loyalty_engine_service_1.LoyaltyEngineService],
    })
], LoyaltyEngineModule);
//# sourceMappingURL=loyalty-engine.module.js.map