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
exports.ClientProgress = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../clients/client.entity");
const loyalty_strategy_entity_1 = require("./loyalty-strategy.entity");
let ClientProgress = class ClientProgress {
    id;
    client;
    strategy;
    progress_value;
};
exports.ClientProgress = ClientProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClientProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client),
    __metadata("design:type", client_entity_1.Client)
], ClientProgress.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => loyalty_strategy_entity_1.LoyaltyStrategy),
    __metadata("design:type", loyalty_strategy_entity_1.LoyaltyStrategy)
], ClientProgress.prototype, "strategy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ClientProgress.prototype, "progress_value", void 0);
exports.ClientProgress = ClientProgress = __decorate([
    (0, typeorm_1.Entity)('client_progress'),
    (0, typeorm_1.Unique)(['client', 'strategy'])
], ClientProgress);
//# sourceMappingURL=client-progress.entity.js.map