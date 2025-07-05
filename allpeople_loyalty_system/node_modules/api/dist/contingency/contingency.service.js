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
var ContingencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContingencyService = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("../clients/clients.service");
const purchases_service_1 = require("../purchases/purchases.service");
let ContingencyService = ContingencyService_1 = class ContingencyService {
    clientsService;
    purchasesService;
    logger = new common_1.Logger(ContingencyService_1.name);
    constructor(clientsService, purchasesService) {
        this.clientsService = clientsService;
        this.purchasesService = purchasesService;
    }
    async findClientByDocument(documentId, empresaId) {
        const clientsInTenant = await this.clientsService.findAll(empresaId);
        return clientsInTenant.find(client => client.document_id === documentId);
    }
    async processContingency(Cedula, Valor, empresaId) {
        this.logger.log(`Procesando contingencia para cédula: ${Cedula} en empresa ${empresaId}`);
        let client = await this.findClientByDocument(Cedula, empresaId);
        if (!client) {
            this.logger.log(`Cliente con cédula ${Cedula} no encontrado, creando uno nuevo.`);
            const newClientData = {
                document_id: Cedula,
                full_name: 'Cliente de Contingencia',
                phone_number: '0000000000',
            };
            client = await this.clientsService.create(newClientData, empresaId);
        }
        this.logger.log(`Registrando compra de ${Valor} para el cliente ${client.id}`);
        await this.purchasesService.create({
            client_id: client.id,
            amount: parseFloat(Valor),
        }, empresaId);
        this.logger.log(`Contingencia para cédula ${Cedula} procesada exitosamente.`);
        return { success: true, clientId: client.id };
    }
};
exports.ContingencyService = ContingencyService;
exports.ContingencyService = ContingencyService = ContingencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clients_service_1.ClientsService,
        purchases_service_1.PurchasesService])
], ContingencyService);
//# sourceMappingURL=contingency.service.js.map