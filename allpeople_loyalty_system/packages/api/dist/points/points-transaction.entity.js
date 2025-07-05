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
const empresa_entity_1 = require("../empresas/empresa.entity");
const client_entity_1 = require("../clients/client.entity");
const purchase_entity_1 = require("../purchases/purchase.entity");
const rule_entity_1 = require("../rules/rule.entity");
let PointsTransaction = class PointsTransaction {
    id;
    points_earned;
    client_id;
    purchase_id;
    rule_id;
    empresa_id;
    empresa;
    client;
    purchase;
    rule;
    created_at;
};
exports.PointsTransaction = PointsTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PointsTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PointsTransaction.prototype, "points_earned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PointsTransaction.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PointsTransaction.prototype, "purchase_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PointsTransaction.prototype, "rule_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PointsTransaction.prototype, "empresa_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa),
    (0, typeorm_1.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], PointsTransaction.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", client_entity_1.Client)
], PointsTransaction.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => purchase_entity_1.Purchase),
    (0, typeorm_1.JoinColumn)({ name: 'purchase_id' }),
    __metadata("design:type", purchase_entity_1.Purchase)
], PointsTransaction.prototype, "purchase", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rule_entity_1.Rule),
    (0, typeorm_1.JoinColumn)({ name: 'rule_id' }),
    __metadata("design:type", rule_entity_1.Rule)
], PointsTransaction.prototype, "rule", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], PointsTransaction.prototype, "created_at", void 0);
exports.PointsTransaction = PointsTransaction = __decorate([
    (0, typeorm_1.Entity)('points_transactions')
], PointsTransaction);
//# sourceMappingURL=points-transaction.entity.js.map