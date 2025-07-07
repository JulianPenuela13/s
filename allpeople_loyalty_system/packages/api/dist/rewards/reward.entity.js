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
exports.Reward = exports.RewardType = void 0;
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
var RewardType;
(function (RewardType) {
    RewardType["STANDARD"] = "standard";
    RewardType["SECRET"] = "secret";
})(RewardType || (exports.RewardType = RewardType = {}));
let Reward = class Reward {
    id;
    name;
    description;
    type;
    cost_in_points;
    stock;
    is_active;
    empresa;
    empresa_id;
};
exports.Reward = Reward;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Reward.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Reward.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reward.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RewardType,
        default: RewardType.STANDARD,
    }),
    __metadata("design:type", String)
], Reward.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Reward.prototype, "cost_in_points", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: -1 }),
    __metadata("design:type", Number)
], Reward.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Reward.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Reward.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Reward.prototype, "empresa_id", void 0);
exports.Reward = Reward = __decorate([
    (0, typeorm_1.Entity)('rewards')
], Reward);
//# sourceMappingURL=reward.entity.js.map