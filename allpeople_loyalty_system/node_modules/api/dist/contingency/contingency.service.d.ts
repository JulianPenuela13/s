import { ClientsService } from '../clients/clients.service';
import { PurchasesService } from '../purchases/purchases.service';
export declare class ContingencyService {
    private readonly clientsService;
    private readonly purchasesService;
    private readonly logger;
    constructor(clientsService: ClientsService, purchasesService: PurchasesService);
    private findClientByDocument;
    processContingency(Cedula: string, Valor: string, empresaId: number): Promise<any>;
}
