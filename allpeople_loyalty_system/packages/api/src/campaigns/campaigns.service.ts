// packages/api/src/campaigns/campaigns.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Client } from '../clients/client.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Actor } from '../audit/actor.interface';

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

  async announcePointsCampaign(actor: Actor) {
    const empresaId = actor.empresaId;

    // 1. BUSCAMOS LA CAMPAÑA DE LA EMPRESA CORRECTA
    const campaign = await this.strategyRepo.findOneBy({
      key: 'campaigns',
      is_active: true,
      empresa_id: empresaId, // <-- FILTRO DE SEGURIDAD AÑADIDO
    });

    if (!campaign) {
      throw new NotFoundException('No hay una campaña de puntos múltiples activa para anunciar en su empresa.');
    }

    // 2. BUSCAMOS ÚNICAMENTE LOS CLIENTES DE LA EMPRESA CORRECTA
    const clientsOfThisCompany = await this.clientRepo.find({
      where: {
        empresa_id: empresaId, // <-- FILTRO DE SEGURIDAD AÑADIDO
      },
    });

    if (clientsOfThisCompany.length === 0) {
        return { message: 'Su empresa no tiene clientes registrados para notificar.' };
    }
    
    this.logger.log(`Encontrados ${clientsOfThisCompany.length} clientes de la empresa #${empresaId} para notificar.`);

    // Ejecutamos el envío de mensajes en segundo plano
    this.sendNotificationsInBackground(clientsOfThisCompany, campaign.settings);

    return { message: `El anuncio de la campaña ha sido enviado a la cola para ${clientsOfThisCompany.length} clientes.` };
  }

  private async sendNotificationsInBackground(clients: Client[], settings: any) {
    for (const client of clients) {
      try {
        await this.whatsappService.sendCampaignAnnouncementMessage(client, settings);
      } catch (error) {
        this.logger.error(`Falló el envío del anuncio de campaña al cliente ${client.id}`, error.stack);
      }
    }
    this.logger.log('Finalizado el envío de todos los anuncios de campaña.');
  }
}