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
exports.Client = void 0;
const purchase_entity_1 = require("../purchases/purchase.entity");
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
let Client = class Client {
    id;
    document_id;
    full_name;
    phone_number;
    birth_date;
    purchases;
    empresa;
    empresa_id;
    created_at;
};
exports.Client = Client;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Client.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Client.prototype, "document_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Client.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Client.prototype, "phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Client.prototype, "birth_date", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => purchase_entity_1.Purchase, (purchase) => purchase.client),
    __metadata("design:type", Array)
], Client.prototype, "purchases", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Client.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Client.prototype, "empresa_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Client.prototype, "created_at", void 0);
exports.Client = Client = __decorate([
    (0, typeorm_1.Entity)('clients'),
    (0, typeorm_1.Index)(['document_id', 'empresa_id'], { unique: true }),
    (0, typeorm_1.Index)(['phone_number', 'empresa_id'], { unique: true })
], Client);
//# sourceMappingURL=client.entity.js.map