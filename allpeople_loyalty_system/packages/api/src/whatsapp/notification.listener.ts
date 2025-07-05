// packages/api/src/whatsapp/notification.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Client } from '../clients/client.entity';
import { WhatsappService } from './whatsapp.service';

export interface PurchaseProcessedPayload {
    client: Client;
    benefits: any;
    newTotalPoints: number;
}

@Injectable()
export class NotificationListener {
    private readonly logger = new Logger(NotificationListener.name);

    constructor(private whatsappService: WhatsappService) {}

    @OnEvent('purchase.processed')
    async handlePurchaseProcessedEvent(payload: PurchaseProcessedPayload) {
        this.logger.log(`Event 'purchase.processed' received for client ${payload.client.id}. Sending WhatsApp notification...`);
        await this.whatsappService.sendPostPurchaseNotification(
            payload.client,
            payload.benefits,
            payload.newTotalPoints,
        );
    }

    @OnEvent('client.created')
  async handleClientCreatedEvent(client: Client) {
    this.logger.log(`New client created event received for: ${client.full_name}`);
    try {
      await this.whatsappService.sendWelcomeMessage(client);
    } catch (error) {
      this.logger.error(`Failed to send welcome message to ${client.full_name}`, error);
    }
  }

}