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
const Papa = require("papaparse");
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
    async processContingencyFile(fileBuffer, actor) {
        const fileContent = fileBuffer.toString('utf-8');
        const results = { processed: 0, failed: 0, errors: [] };
        const parsed = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
        });
        for (const row of parsed.data) {
            try {
                if (typeof row !== 'object' || row === null || Object.values(row).every(v => !v)) {
                    continue;
                }
                const { Cedula, Valor, NombreCompleto, Telefono, FechaNacimiento } = row;
                if (!Cedula || !Valor) {
                    throw new common_1.BadRequestException(`Fila inválida, faltan datos de Cedula o Valor: ${JSON.stringify(row)}`);
                }
                let client = await this.clientsService.findOneByDocument(Cedula, actor);
                if (!client) {
                    this.logger.log(`Cliente con documento ${Cedula} no encontrado en empresa ${actor.empresaId}. Intentando crear...`);
                    if (!NombreCompleto || !Telefono) {
                        throw new common_1.BadRequestException(`Cliente nuevo con cédula ${Cedula} no tiene NombreCompleto y Telefono.`);
                    }
                    const cleanTelefono = String(Telefono).replace(/\D/g, '');
                    const newClientData = {
                        document_id: Cedula,
                        full_name: NombreCompleto,
                        phone_number: cleanTelefono,
                    };
                    if (FechaNacimiento) {
                        const parts = String(FechaNacimiento).split('/');
                        if (parts.length === 3) {
                            const [day, month, year] = parts;
                            newClientData.birth_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        }
                    }
                    client = await this.clientsService.create(newClientData, actor);
                    this.logger.log(`Cliente ${client.full_name} creado para la empresa ${actor.empresaId}.`);
                }
                await this.purchasesService.createPurchase({
                    client_document_id: client.document_id,
                    amount: Number(Valor),
                }, actor);
                results.processed++;
            }
            catch (error) {
                this.logger.error(`Error al procesar fila: ${JSON.stringify(row)}`, error.stack);
                results.failed++;
                results.errors.push(`Fila ${JSON.stringify(row)}: ${error.message}`);
            }
        }
        this.logger.log(`Archivo de contingencia para empresa ${actor.empresaId} procesado: ${results.processed} exitosos, ${results.failed} fallidos.`);
        return results;
    }
};
exports.ContingencyService = ContingencyService;
exports.ContingencyService = ContingencyService = ContingencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clients_service_1.ClientsService,
        purchases_service_1.PurchasesService])
], ContingencyService);
//# sourceMappingURL=contingency.service.js.map