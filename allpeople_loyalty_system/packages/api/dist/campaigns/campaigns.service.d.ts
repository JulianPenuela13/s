import { Repository } from 'typeorm';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Client } from '../clients/client.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class CampaignsService {
    private strategyRepo;
    private clientRepo;
    private whatsappService;
    private readonly logger;
    constructor(strategyRepo: Repository<LoyaltyStrategy>, clientRepo: Repository<Client>, whatsappService: WhatsappService);
    announcePointsCampaign(): Promise<{
        message: string;
    }>;
    private sendNotificationsInBackground;
}
