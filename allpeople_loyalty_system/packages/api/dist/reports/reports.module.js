"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const reports_controller_1 = require("./reports.controller");
const typeorm_1 = require("@nestjs/typeorm");
const points_transaction_entity_1 = require("../loyalty-engine/points-transaction.entity");
const redemption_entity_1 = require("../rewards/redemption.entity");
const client_entity_1 = require("../clients/client.entity");
const purchase_entity_1 = require("../purchases/purchase.entity");
const cashback_ledger_entity_1 = require("../loyalty-engine/cashback-ledger.entity");
const unlocked_reward_entity_1 = require("../rewards/unlocked-reward.entity");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                points_transaction_entity_1.PointsTransaction,
                redemption_entity_1.Redemption,
                client_entity_1.Client,
                purchase_entity_1.Purchase,
                cashback_ledger_entity_1.CashbackLedger,
                unlocked_reward_entity_1.UnlockedReward,
                loyalty_strategy_entity_1.LoyaltyStrategy,
            ]),
        ],
        providers: [reports_service_1.ReportsService],
        controllers: [reports_controller_1.ReportsController],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map