import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';
import { LoyaltyEngineService } from '../loyalty-engine/loyalty-engine.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Client } from '../clients/client.entity';
import { Actor } from '../audit/actor.interface';
export declare class PurchasesService {
    private purchasesRepository;
    private clientsRepository;
    private loyaltyEngineService;
    constructor(purchasesRepository: Repository<Purchase>, clientsRepository: Repository<Client>, loyaltyEngineService: LoyaltyEngineService);
    createPurchase(dto: CreatePurchaseDto, actor: Actor): Promise<{
        message: string;
        purchaseId: string;
        clientId: string;
        clientName: string;
        benefitsAwarded: any;
    }>;
}
