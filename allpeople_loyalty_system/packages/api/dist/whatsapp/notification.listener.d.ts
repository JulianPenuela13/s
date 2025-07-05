import { Client } from '../clients/client.entity';
import { WhatsappService } from './whatsapp.service';
export interface PurchaseProcessedPayload {
    client: Client;
    benefits: any;
    newTotalPoints: number;
}
export declare class NotificationListener {
    private whatsappService;
    private readonly logger;
    constructor(whatsappService: WhatsappService);
    handlePurchaseProcessedEvent(payload: PurchaseProcessedPayload): Promise<void>;
    handleClientCreatedEvent(client: Client): Promise<void>;
}
