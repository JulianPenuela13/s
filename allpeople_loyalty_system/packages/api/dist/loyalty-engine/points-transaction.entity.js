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
exports.PointsTransaction = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../clients/client.entity");
const purchase_entity_1 = require("../purchases/purchase.entity");
const redemption_entity_1 = require("../rewards/redemption.entity");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
const typeorm_2 = require("typeorm");
let PointsTransaction = class PointsTransaction {
    id;
    client;
    purchase;
    redemption;
    points_change;
    base_points;
    bonus_points;
    reason;
    empresa;
    empresa_id;
    created_at;
    expires_at;
};
exports.PointsTransaction = PointsTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], PointsTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client),
    __metadata("design:type", client_entity_1.Client)
], PointsTransaction.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => purchase_entity_1.Purchase, { nullable: true }),
    __metadata("design:type", purchase_entity_1.Purchase)
], PointsTransaction.prototype, "purchase", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => redemption_entity_1.Redemption, { nullable: true }),
    __metadata("design:type", redemption_entity_1.Redemption)
], PointsTransaction.prototype, "redemption", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PointsTransaction.prototype, "points_change", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PointsTransaction.prototype, "base_points", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PointsTransaction.prototype, "bonus_points", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PointsTransaction.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_2.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], PointsTransaction.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PointsTransaction.prototype, "empresa_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], PointsTransaction.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], PointsTransaction.prototype, "expires_at", void 0);
exports.PointsTransaction = PointsTransaction = __decorate([
    (0, typeorm_1.Entity)('points_transactions')
], PointsTransaction);
//# sourceMappingURL=points-transaction.entity.js.map