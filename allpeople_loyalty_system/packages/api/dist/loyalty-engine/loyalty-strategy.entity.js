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
exports.LoyaltyStrategy = void 0;
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
let LoyaltyStrategy = class LoyaltyStrategy {
    id;
    key;
    name;
    is_active;
    empresa;
    empresa_id;
    settings;
};
exports.LoyaltyStrategy = LoyaltyStrategy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LoyaltyStrategy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LoyaltyStrategy.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LoyaltyStrategy.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LoyaltyStrategy.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], LoyaltyStrategy.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LoyaltyStrategy.prototype, "empresa_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], LoyaltyStrategy.prototype, "settings", void 0);
exports.LoyaltyStrategy = LoyaltyStrategy = __decorate([
    (0, typeorm_1.Entity)('loyalty_strategies'),
    (0, typeorm_1.Index)(['key', 'empresa_id'], { unique: true })
], LoyaltyStrategy);
//# sourceMappingURL=loyalty-strategy.entity.js.map