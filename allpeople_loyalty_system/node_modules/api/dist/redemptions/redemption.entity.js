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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redemption = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../clients/client.entity");
const reward_entity_1 = require("../rewards/reward.entity");
const user_entity_1 = require("../users/user.entity");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
const empresa_entity_1 = require("../empresas/empresa.entity");
let Redemption = class Redemption {
    id;
    client;
    reward;
    user;
    strategy;
    empresa_id;
    empresa;
    points_used;
    created_at;
};
exports.Redemption = Redemption;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Redemption.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client),
    __metadata("design:type", client_entity_1.Client)
], Redemption.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reward_entity_1.Reward),
    __metadata("design:type", reward_entity_1.Reward)
], Redemption.prototype, "reward", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], Redemption.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => loyalty_strategy_entity_1.LoyaltyStrategy, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", loyalty_strategy_entity_1.LoyaltyStrategy)
], Redemption.prototype, "strategy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Redemption.prototype, "empresa_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa),
    (0, typeorm_1.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Redemption.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Redemption.prototype, "points_used", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Redemption.prototype, "created_at", void 0);
exports.Redemption = Redemption = __decorate([
    (0, typeorm_1.Entity)('redemptions')
], Redemption);
//# sourceMappingURL=redemption.entity.js.map