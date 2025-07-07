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
exports.CashbackLedger = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../clients/client.entity");
const purchase_entity_1 = require("../purchases/purchase.entity");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
let CashbackLedger = class CashbackLedger {
    id;
    client;
    purchase;
    amount_change;
    reason;
    empresa;
    empresa_id;
    created_at;
};
exports.CashbackLedger = CashbackLedger;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], CashbackLedger.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client),
    __metadata("design:type", client_entity_1.Client)
], CashbackLedger.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => purchase_entity_1.Purchase, { nullable: true }),
    __metadata("design:type", purchase_entity_1.Purchase)
], CashbackLedger.prototype, "purchase", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], CashbackLedger.prototype, "amount_change", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CashbackLedger.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], CashbackLedger.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CashbackLedger.prototype, "empresa_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CashbackLedger.prototype, "created_at", void 0);
exports.CashbackLedger = CashbackLedger = __decorate([
    (0, typeorm_1.Entity)('cashback_ledger')
], CashbackLedger);
//# sourceMappingURL=cashback-ledger.entity.js.map