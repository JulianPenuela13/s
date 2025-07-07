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
const points_transaction_entity_1 = require("./points-transaction.entity");
const loyalty_strategy_entity_1 = require("./loyalty-strategy.entity");
const loyalty_engine_service_1 = require("./loyalty-engine.service");
const cashback_ledger_entity_1 = require("./cashback-ledger.entity");
const client_progress_entity_1 = require("./client-progress.entity");
const unlocked_reward_entity_1 = require("../rewards/unlocked-reward.entity");
const reward_entity_1 = require("../rewards/reward.entity");
let LoyaltyEngineModule = class LoyaltyEngineModule {
};
exports.LoyaltyEngineModule = LoyaltyEngineModule;
exports.LoyaltyEngineModule = LoyaltyEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                points_transaction_entity_1.PointsTransaction,
                loyalty_strategy_entity_1.LoyaltyStrategy,
                cashback_ledger_entity_1.CashbackLedger,
                client_progress_entity_1.ClientProgress,
                unlocked_reward_entity_1.UnlockedReward,
                reward_entity_1.Reward,
            ]),
        ],
        providers: [loyalty_engine_service_1.LoyaltyEngineService],
        exports: [loyalty_engine_service_1.LoyaltyEngineService],
    })
], LoyaltyEngineModule);
//# sourceMappingURL=loyalty-engine.module.js.map