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
exports.Empresa = exports.WhatsappProvider = void 0;
const typeorm_1 = require("typeorm");
var WhatsappProvider;
(function (WhatsappProvider) {
    WhatsappProvider["TWILIO"] = "twilio";
    WhatsappProvider["WPPCONNECT"] = "wppconnect";
    WhatsappProvider["NONE"] = "none";
})(WhatsappProvider || (exports.WhatsappProvider = WhatsappProvider = {}));
let Empresa = class Empresa {
    id;
    nombre_empresa;
    plan_suscripcion;
    estado_suscripcion;
    whatsapp_provider;
    wpp_session_name;
    twilio_phone_number;
    fecha_creacion;
};
exports.Empresa = Empresa;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Empresa.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Empresa.prototype, "nombre_empresa", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Empresa.prototype, "plan_suscripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'activa' }),
    __metadata("design:type", String)
], Empresa.prototype, "estado_suscripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WhatsappProvider,
        default: WhatsappProvider.NONE,
    }),
    __metadata("design:type", String)
], Empresa.prototype, "whatsapp_provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, unique: true }),
    __metadata("design:type", Object)
], Empresa.prototype, "wpp_session_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, unique: true }),
    __metadata("design:type", Object)
], Empresa.prototype, "twilio_phone_number", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Empresa.prototype, "fecha_creacion", void 0);
exports.Empresa = Empresa = __decorate([
    (0, typeorm_1.Entity)('empresas')
], Empresa);
//# sourceMappingURL=empresa.entity.js.map