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
exports.UnlockedReward = void 0;
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("../empresas/empresa.entity");
const client_entity_1 = require("../clients/client.entity");
const reward_entity_1 = require("../rewards/reward.entity");
let UnlockedReward = class UnlockedReward {
    id;
    client_id;
    reward_id;
    is_redeemed;
    empresa_id;
    empresa;
    client;
    reward;
    created_at;
};
exports.UnlockedReward = UnlockedReward;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UnlockedReward.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], UnlockedReward.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], UnlockedReward.prototype, "reward_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UnlockedReward.prototype, "is_redeemed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], UnlockedReward.prototype, "empresa_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa),
    (0, typeorm_1.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], UnlockedReward.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", client_entity_1.Client)
], UnlockedReward.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reward_entity_1.Reward),
    (0, typeorm_1.JoinColumn)({ name: 'reward_id' }),
    __metadata("design:type", reward_entity_1.Reward)
], UnlockedReward.prototype, "reward", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], UnlockedReward.prototype, "created_at", void 0);
exports.UnlockedReward = UnlockedReward = __decorate([
    (0, typeorm_1.Entity)('unlocked_rewards')
], UnlockedReward);
//# sourceMappingURL=unlocked-reward.entity.js.map