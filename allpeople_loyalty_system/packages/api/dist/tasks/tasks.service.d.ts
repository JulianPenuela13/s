import { Repository } from 'typeorm';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Client } from '../clients/client.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class TasksService {
    private pointsRepo;
    private strategyRepo;
    private clientRepo;
    private empresaRepo;
    private whatsappService;
    private readonly logger;
    constructor(pointsRepo: Repository<PointsTransaction>, strategyRepo: Repository<LoyaltyStrategy>, clientRepo: Repository<Client>, empresaRepo: Repository<Empresa>, whatsappService: WhatsappService);
    handlePointsExpiration(): Promise<void>;
    handleBirthdayCampaign(): Promise<void>;
    private invalidateExpiredPoints;
    private notifyUpcomingExpirations;
}
