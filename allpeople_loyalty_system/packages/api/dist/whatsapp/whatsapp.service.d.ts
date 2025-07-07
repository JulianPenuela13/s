import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Reward } from '../rewards/reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class WhatsappService {
    private configService;
    private strategyRepository;
    private empresaRepository;
    private twilioClient;
    private readonly logger;
    constructor(configService: ConfigService, strategyRepository: Repository<LoyaltyStrategy>, empresaRepository: Repository<Empresa>);
    sendMessage(client: Client, body: string): Promise<void>;
    private _sendWithTwilio;
    private _sendWithWPPConnect;
    sendWelcomeMessage(client: Client): Promise<void>;
    sendPostPurchaseNotification(client: Client, benefits: any, newTotalPoints: number): Promise<void>;
    sendRedemptionNotification(client: Client, reward: Reward, newTotalPoints: number): Promise<void>;
    sendPointsExpirationWarning(client: Client, pointsToExpire: number, days: number): Promise<void>;
    sendBirthdayMessage(client: Client, messageTemplate: string): Promise<void>;
    sendCampaignAnnouncementMessage(client: Client, settings: any): Promise<void>;
}
