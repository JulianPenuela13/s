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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_entity_1 = require("./purchase.entity");
const loyalty_engine_service_1 = require("../loyalty-engine/loyalty-engine.service");
const client_entity_1 = require("../clients/client.entity");
let PurchasesService = class PurchasesService {
    purchasesRepository;
    clientsRepository;
    loyaltyEngineService;
    constructor(purchasesRepository, clientsRepository, loyaltyEngineService) {
        this.purchasesRepository = purchasesRepository;
        this.clientsRepository = clientsRepository;
        this.loyaltyEngineService = loyaltyEngineService;
    }
    async createPurchase(dto, actor) {
        const empresaId = actor.empresaId;
        const client = await this.clientsRepository.findOneBy({
            document_id: dto.client_document_id,
            empresa_id: empresaId,
        });
        if (!client) {
            throw new common_1.NotFoundException(`No se puede registrar la compra porque el cliente con cédula ${dto.client_document_id} no existe en su empresa.`);
        }
        const purchase = this.purchasesRepository.create({
            client: client,
            amount: dto.amount,
            empresa_id: empresaId,
        });
        const savedPurchase = await this.purchasesRepository.save(purchase);
        const benefits = await this.loyaltyEngineService.processPurchase(savedPurchase, actor);
        return {
            message: 'Compra registrada y procesada exitosamente.',
            purchaseId: savedPurchase.id,
            clientId: client.id,
            clientName: client.full_name,
            benefitsAwarded: benefits,
        };
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_entity_1.Purchase)),
    __param(1, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        loyalty_engine_service_1.LoyaltyEngineService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map