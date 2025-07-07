import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    create(createPurchaseDto: CreatePurchaseDto, req: any): Promise<{
        message: string;
        purchaseId: string;
        clientId: string;
        clientName: string;
        benefitsAwarded: any;
    }>;
}
