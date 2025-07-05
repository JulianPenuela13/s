import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Reward } from '../rewards/reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
export declare class WhatsappService {
    private configService;
    private strategyRepository;
    private twilioClient;
    private readonly logger;
    constructor(configService: ConfigService, strategyRepository: Repository<LoyaltyStrategy>);
    sendPostPurchaseNotification(client: Client, benefits: any, newTotalPoints: number): Promise<void>;
    sendRedemptionNotification(client: Client, reward: Reward, newTotalPoints: number): Promise<void>;
    sendMessage(to: string, body: string): Promise<void>;
    sendPointsExpirationWarning(client: Client, pointsToExpire: number, days: number): Promise<void>;
    sendBirthdayMessage(client: Client, messageTemplate: string): Promise<void>;
    sendWelcomeMessage(client: Client): Promise<void>;
    sendCampaignAnnouncementMessage(client: Client, settings: any): Promise<void>;
}
