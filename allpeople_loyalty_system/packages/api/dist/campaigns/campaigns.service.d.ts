import { Repository } from 'typeorm';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Client } from '../clients/client.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Actor } from '../audit/actor.interface';
export declare class CampaignsService {
    private strategyRepo;
    private clientRepo;
    private whatsappService;
    private readonly logger;
    constructor(strategyRepo: Repository<LoyaltyStrategy>, clientRepo: Repository<Client>, whatsappService: WhatsappService);
    announcePointsCampaign(actor: Actor): Promise<{
        message: string;
    }>;
    private sendNotificationsInBackground;
}
