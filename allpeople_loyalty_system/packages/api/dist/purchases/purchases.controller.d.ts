import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    create(createPurchaseDto: CreatePurchaseDto, req: any): Promise<import("./purchase.entity").Purchase>;
    findAll(req: any): Promise<import("./purchase.entity").Purchase[]>;
    findOne(id: string, req: any): Promise<import("./purchase.entity").Purchase>;
    remove(id: string, req: any): Promise<void>;
}
