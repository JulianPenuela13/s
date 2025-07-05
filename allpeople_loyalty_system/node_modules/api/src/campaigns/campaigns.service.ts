// packages/api/src/campaigns/campaigns.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Client } from '../clients/client.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(LoyaltyStrategy)
    private strategyRepo: Repository<LoyaltyStrategy>,
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    private whatsappService: WhatsappService,
  ) {}

  async announcePointsCampaign() {
    const campaign = await this.strategyRepo.findOneBy({ key: 'campaigns', is_active: true });
    if (!campaign) {
      throw new NotFoundException('No hay una campaña de puntos múltiples activa para anunciar.');
    }

    const allClients = await this.clientRepo.find();
    this.logger.log(`Found ${allClients.length} clients to notify about the campaign.`);

    // Ejecutamos el envío de mensajes en segundo plano para no bloquear la respuesta al admin
    this.sendNotificationsInBackground(allClients, campaign.settings);

    return { message: `El anuncio de la campaña ha sido enviado a la cola para ${allClients.length} clientes.` };
  }

  private async sendNotificationsInBackground(clients: Client[], settings: any) {
    for (const client of clients) {
      try {
        await this.whatsappService.sendCampaignAnnouncementMessage(client, settings);
      } catch (error) {
        this.logger.error(`Failed to send campaign announcement to client ${client.id}`, error);
      }
    }
    this.logger.log('Finished sending all campaign announcements.');
  }
}