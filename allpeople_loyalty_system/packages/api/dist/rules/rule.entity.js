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
exports.Rule = exports.ActionType = exports.RuleType = void 0;
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("../empresas/empresa.entity");
var RuleType;
(function (RuleType) {
    RuleType["PURCHASE_AMOUNT"] = "purchase_amount";
    RuleType["CLIENT_TAG"] = "client_tag";
})(RuleType || (exports.RuleType = RuleType = {}));
var ActionType;
(function (ActionType) {
    ActionType["GRANT_POINTS"] = "grant_points";
    ActionType["UNLOCK_REWARD"] = "unlock_reward";
})(ActionType || (exports.ActionType = ActionType = {}));
let Rule = class Rule {
    id;
    name;
    type;
    threshold;
    required_tag;
    action_type;
    action_value;
    is_active;
    empresa_id;
    empresa;
    created_at;
};
exports.Rule = Rule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Rule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Rule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RuleType,
    }),
    __metadata("design:type", String)
], Rule.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Rule.prototype, "threshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Rule.prototype, "required_tag", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ActionType,
    }),
    __metadata("design:type", String)
], Rule.prototype, "action_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Rule.prototype, "action_value", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Rule.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Rule.prototype, "empresa_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa),
    (0, typeorm_1.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Rule.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Rule.prototype, "created_at", void 0);
exports.Rule = Rule = __decorate([
    (0, typeorm_1.Entity)('rules')
], Rule);
//# sourceMappingURL=rule.entity.js.map