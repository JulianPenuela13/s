import { ClientsService } from '../clients/clients.service';
import { PurchasesService } from '../purchases/purchases.service';
import { Actor } from '../audit/actor.interface';
export declare class ContingencyService {
    private readonly clientsService;
    private readonly purchasesService;
    private readonly logger;
    constructor(clientsService: ClientsService, purchasesService: PurchasesService);
    processContingencyFile(fileBuffer: Buffer, actor: Actor): Promise<{
        processed: number;
        failed: number;
        errors: string[];
    }>;
}
