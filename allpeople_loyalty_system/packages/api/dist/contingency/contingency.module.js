"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContingencyModule = void 0;
const common_1 = require("@nestjs/common");
const contingency_controller_1 = require("./contingency.controller");
const contingency_service_1 = require("./contingency.service");
const loyalty_engine_module_1 = require("../loyalty-engine/loyalty-engine.module");
const clients_module_1 = require("../clients/clients.module");
const purchases_module_1 = require("../purchases/purchases.module");
let ContingencyModule = class ContingencyModule {
};
exports.ContingencyModule = ContingencyModule;
exports.ContingencyModule = ContingencyModule = __decorate([
    (0, common_1.Module)({
        imports: [loyalty_engine_module_1.LoyaltyEngineModule, clients_module_1.ClientsModule, purchases_module_1.PurchasesModule],
        controllers: [contingency_controller_1.ContingencyController],
        providers: [contingency_service_1.ContingencyService],
    })
], ContingencyModule);
//# sourceMappingURL=contingency.module.js.map