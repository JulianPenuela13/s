// packages/api/src/whatsapp/whatsapp.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm'; // Importar InjectRepository
import { Repository } from 'typeorm'; // Importar Repository
import { Twilio } from 'twilio';
import { Client } from '../clients/client.entity';
import { Reward } from '../rewards/reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';

@Injectable()
export class WhatsappService {
  private twilioClient: Twilio;
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private configService: ConfigService,
    // Inyectamos el repositorio para poder consultar las estrategias
    @InjectRepository(LoyaltyStrategy)
    private strategyRepository: Repository<LoyaltyStrategy>,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
        this.logger.error('Twilio credentials are not configured. WhatsApp messages will not be sent.');
        return;
    }
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendPostPurchaseNotification(client: Client, benefits: any, newTotalPoints: number) {
    if (!client.phone_number) return;
    
    const directBenefits: string[] = [];
    if (benefits.points_earned > 0) {
        directBenefits.push(`*${benefits.points_earned}* puntos`);
    }
    if (benefits.cashback_earned > 0) {
        const cashbackFormatted = benefits.cashback_earned.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
        directBenefits.push(`*${cashbackFormatted}* de cashback`);
    }
    if (benefits.reward_unlocked) {
        directBenefits.push(`¡un premio sorpresa! 🎉`);
    }
    
    let progressText = '';
    if (benefits.progress_updates && benefits.progress_updates.length > 0) {
        progressText = '\n\n*Tu Progreso:*';
        benefits.progress_updates.forEach((update: any) => {
            progressText += `\n- ${update.strategy_name}: Ahora llevas *${update.progress_text}* compras.`;
        });
    }

    if (directBenefits.length === 0 && progressText === '') {
        this.logger.log('No new benefits or progress to notify for this purchase.');
        return;
    }

    const clientFirstName = client.full_name.split(' ')[0];
    let body = `¡Hola ${clientFirstName}! Tu compra en All People fue un éxito.`;

    if (directBenefits.length > 0) {
      body += ` Acabas de ganar ${directBenefits.join(' y ')}.`;
    }

    body += progressText;
    
    // --- LÓGICA CORREGIDA PARA EL SALDO DE PUNTOS ---
    // 1. Verificamos si la estrategia de puntos está activa
    const pointsStrategy = await this.strategyRepository.findOneBy({ key: 'points', is_active: true });
    
    // 2. Solo añadimos la línea del saldo si la estrategia está activa
    if (pointsStrategy) {
        body += `\n\nTu saldo de puntos es de *${newTotalPoints}*.`;
    }
    
    body += `\n\n¡Gracias por tu lealtad!`;
    
    const recipientNumber = `whatsapp:${client.phone_number}`;
    await this.sendMessage(recipientNumber, body);
  }

  async sendRedemptionNotification(client: Client, reward: Reward, newTotalPoints: number) {
    if (!client.phone_number) return;
    const clientFirstName = client.full_name.split(' ')[0];
    const body = `¡Hola ${clientFirstName}! Has canjeado con éxito tu recompensa: *${reward.name}*. ✨\n\nTu nuevo saldo es de *${newTotalPoints}* puntos. ¡Disfrútala!`;
    const recipientNumber = `whatsapp:${client.phone_number}`;
    await this.sendMessage(recipientNumber, body);
  }

  async sendMessage(to: string, body: string) {
    if (!this.twilioClient) {
        this.logger.warn(`Skipping WhatsApp message to ${to} because Twilio client is not initialized.`);
        return;
    }
    const from = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER');
    try {
      await this.twilioClient.messages.create({ from, to, body });
      this.logger.log(`Message sent to ${to}`);
    } catch (error) {
      this.logger.error("Could not send WhatsApp message", error);
    }
  }

  async sendPointsExpirationWarning(client: Client, pointsToExpire: number, days: number) {
    if (!client.phone_number) return;

    const clientFirstName = client.full_name.split(' ')[0];
    const body = `¡Hola ${clientFirstName}! ⏰ Ojo, tienes *${pointsToExpire}* puntos que vencerán en los próximos *${days} días*. ¡No dejes que se pierdan, canjéalos por premios increíbles en All People!`;

    const recipientNumber = `whatsapp:${client.phone_number}`;
    await this.sendMessage(recipientNumber, body);
  }

  async sendBirthdayMessage(client: Client, messageTemplate: string) {
  if (!client.phone_number) return;

  const clientFirstName = client.full_name.split(' ')[0];
  // Reemplazamos el placeholder [NOMBRE] con el nombre real
  const body = messageTemplate.replace(/\[NOMBRE\]/g, clientFirstName);

  this.logger.log(`Sending birthday message to ${client.full_name}`);
  const recipientNumber = `whatsapp:${client.phone_number}`;
  await this.sendMessage(recipientNumber, body);
  }

async sendWelcomeMessage(client: Client) {
  if (!client.phone_number) return;

  // 1. Buscamos las estrategias activas para saber qué opciones mostrar
  const activeStrategies = await this.strategyRepository.findBy({ is_active: true });
  const activeKeys = activeStrategies.map(s => s.key);

  const clientFirstName = client.full_name.split(' ')[0];
  let body = `¡Hola ${clientFirstName}! 👋 Bienvenido al programa de lealtad de All People. ¡Ya estás acumulando beneficios con cada compra!\n\nEstos son los comandos que puedes usar:`;

  // 2. Construimos la lista de comandos dinámicamente
  if (activeKeys.includes('points')) {
    body += `\n- Envía *puntos* para consultar tu saldo.`;
  }
  if (activeKeys.includes('frequency') || activeKeys.includes('random_prizes')) {
    body += `\n- Envía *progreso* para ver cuánto te falta para tu próximo premio.`;
  }
  // Siempre puedes añadir un comando de ayuda general
  body += `\n- Envía *ayuda* si tienes alguna pregunta.`;

  body += `\n\n¡Estamos felices de tenerte!`;

  this.logger.log(`Sending welcome message to new client ${client.full_name}`);
  const recipientNumber = `whatsapp:${client.phone_number}`;
  await this.sendMessage(recipientNumber, body);
}

async sendCampaignAnnouncementMessage(client: Client, settings: any) {
  if (!client.phone_number) return;

  const clientFirstName = client.full_name.split(' ')[0];
  const startDate = new Date(settings.start_date).toLocaleDateString('es-CO');
  const endDate = new Date(settings.end_date).toLocaleDateString('es-CO');

  const body = `¡Hola ${clientFirstName}! ✨ ¡Tenemos noticias increíbles! Del ${startDate} al ${endDate}, todas tus compras en All People te darán *x${settings.multiplier} PUNTOS*. ¡No te pierdas esta oportunidad única para acumular más y ganar premios! 🚀`;

  await this.sendMessage(`whatsapp:${client.phone_number}`, body);
}  
}