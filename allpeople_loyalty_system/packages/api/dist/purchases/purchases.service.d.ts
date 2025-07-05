import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
export declare class PurchasesService {
    private purchasesRepository;
    constructor(purchasesRepository: Repository<Purchase>);
    create(createPurchaseDto: CreatePurchaseDto, empresaId: number): Promise<Purchase>;
    findAll(empresaId: number): Promise<Purchase[]>;
    findOne(id: string, empresaId: number): Promise<Purchase>;
    remove(id: string, empresaId: number): Promise<void>;
}
