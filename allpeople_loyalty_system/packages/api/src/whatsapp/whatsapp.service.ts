// packages/api/src/whatsapp/whatsapp.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Twilio } from 'twilio';
import { Client } from '../clients/client.entity';
import { Reward } from '../rewards/reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Empresa, WhatsappProvider } from '../empresas/entities/empresa.entity';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private twilioClient: Twilio;
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(LoyaltyStrategy)
    private strategyRepository: Repository<LoyaltyStrategy>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = new Twilio(accountSid, authToken);
    } else {
      this.logger.warn('Las credenciales de Twilio no están configuradas. Los mensajes vía Twilio estarán deshabilitados.');
    }
  }

  // MÉTODO PÚBLICO PRINCIPAL: Otros servicios llaman a este método genérico.
  public async sendMessage(client: Client, body: string) {
    if (!client || !client.empresa_id) {
        this.logger.error(`Intento de enviar mensaje a un cliente sin empresa_id: ${client.id}`);
        return;
    }

    const empresa = await this.empresaRepository.findOneBy({ id: client.empresa_id });
    if (!empresa) {
        this.logger.error(`No se encontró la empresa con ID ${client.empresa_id} para el cliente ${client.id}`);
        return;
    }

    // EL DESPACHADOR INTELIGENTE: Decide qué método usar basado en la configuración de la empresa.
    switch (empresa.whatsapp_provider) {
      case WhatsappProvider.TWILIO:
        await this._sendWithTwilio(client.phone_number, body, empresa.twilio_phone_number);
        break;
      case WhatsappProvider.WPPCONNECT:
        await this._sendWithWPPConnect(client.phone_number, body, empresa.wpp_session_name);
        break;
      default:
        this.logger.log(`WhatsApp está desactivado para la empresa #${empresa.id}. No se envió mensaje a ${client.phone_number}.`);
        break;
    }
  }
  
  // MÉTODO PRIVADO PARA ENVIAR CON TWILIO
  private async _sendWithTwilio(to: string, body: string, from: string | null) {
    if (!this.twilioClient) {
      this.logger.error(`Se intentó enviar con Twilio, pero el cliente no está inicializado.`);
      return;
    }
    if (!from) {
      this.logger.error(`La empresa no tiene un número de Twilio configurado. Mensaje no enviado a ${to}.`);
      return;
    }
    try {
      await this.twilioClient.messages.create({
        from: `whatsapp:${from}`,
        to: `whatsapp:${to}`,
        body,
      });
      this.logger.log(`Mensaje enviado a ${to} vía Twilio desde ${from}.`);
    } catch (error) {
      this.logger.error(`Error enviando mensaje con Twilio a ${to}: ${error.message}`);
    }
  }

  // MÉTODO PRIVADO PARA ENVIAR CON WPPCONNECT
  private async _sendWithWPPConnect(to: string, body: string, sessionName: string | null) {
    if (!sessionName) {
        this.logger.error(`La empresa no tiene una sesión de WPPConnect configurada. Mensaje no enviado a ${to}.`);
        return;
    }
    
    const wppServerUrl = this.configService.get<string>('WPP_SERVER_URL', 'http://localhost:21465');

    try {
      // La ruta puede variar según la implementación de tu servidor WPPConnect
      await axios.post(`${wppServerUrl}/api/${sessionName}/send-message`, {
        phone: to,
        message: body,
      });
      this.logger.log(`Mensaje enviado a ${to} vía WPPConnect (sesión: ${sessionName}).`);
    } catch (error) {
      this.logger.error(`Error enviando mensaje con WPPConnect a ${to}: ${error.response?.data?.message || error.message}`);
    }
  }

  // --- MÉTODOS DE NOTIFICACIÓN ---
  // Estos métodos ahora simplemente construyen el mensaje y llaman al despachador principal.

  async sendWelcomeMessage(client: Client) {
    if (!client.phone_number) return;
    const empresaId = client.empresa_id;

    const activeStrategies = await this.strategyRepository.findBy({ is_active: true, empresa_id: empresaId });
    const activeKeys = activeStrategies.map(s => s.key);

    const clientFirstName = client.full_name.split(' ')[0];
    let body = `¡Hola ${clientFirstName}! 👋 Bienvenido al programa de lealtad. ¡Ya estás acumulando beneficios con cada compra!\n\nEstos son los comandos que puedes usar:`;

    if (activeKeys.includes('points')) {
      body += `\n- Envía *puntos* para consultar tu saldo.`;
    }
    if (activeKeys.some(key => ['frequency', 'random_prizes', 'secret_rewards'].includes(key))) {
      body += `\n- Envía *progreso* para ver tu avance.`;
    }
    
    await this.sendMessage(client, body);
  }

  async sendPostPurchaseNotification(client: Client, benefits: any, newTotalPoints: number) {
    if (!client.phone_number) return;
    const empresaId = client.empresa_id;

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

    if (directBenefits.length === 0 && progressText === '') return;

    const clientFirstName = client.full_name.split(' ')[0];
    let body = `¡Hola ${clientFirstName}! Gracias por tu compra.`;

    if (directBenefits.length > 0) {
      body += ` Acabas de ganar ${directBenefits.join(' y ')}.`;
    }

    body += progressText;
    
    const pointsStrategy = await this.strategyRepository.findOneBy({ key: 'points', is_active: true, empresa_id: empresaId });
    if (pointsStrategy) {
      body += `\n\nTu saldo de puntos es de *${newTotalPoints}*.`;
    }
    
    body += `\n\n¡Gracias por tu lealtad!`;
    
    await this.sendMessage(client, body);
  }

  async sendRedemptionNotification(client: Client, reward: Reward, newTotalPoints: number) {
    if (!client.phone_number) return;
    const clientFirstName = client.full_name.split(' ')[0];
    const body = `¡Hola ${clientFirstName}! Has canjeado con éxito tu recompensa: *${reward.name}*. ✨\n\nTu nuevo saldo es de *${newTotalPoints}* puntos. ¡Disfrútala!`;
    await this.sendMessage(client, body);
  }

  async sendPointsExpirationWarning(client: Client, pointsToExpire: number, days: number) {
    if (!client.phone_number) return;
    const clientFirstName = client.full_name.split(' ')[0];
    const body = `¡Hola ${clientFirstName}! ⏰ Ojo, tienes *${pointsToExpire}* puntos que vencerán en los próximos *${days} días*. ¡No dejes que se pierdan, canjéalos por premios increíbles!`;
    await this.sendMessage(client, body);
  }

  async sendBirthdayMessage(client: Client, messageTemplate: string) {
    if (!client.phone_number) return;
    const clientFirstName = client.full_name.split(' ')[0];
    const body = messageTemplate.replace(/\[NOMBRE\]/g, clientFirstName);
    await this.sendMessage(client, body);
  }

  async sendCampaignAnnouncementMessage(client: Client, settings: any) {
    if (!client.phone_number) return;
    const clientFirstName = client.full_name.split(' ')[0];
    const startDate = new Date(settings.start_date).toLocaleDateString('es-CO');
    const endDate = new Date(settings.end_date).toLocaleDateString('es-CO');
    const body = `¡Hola ${clientFirstName}! ✨ ¡Tenemos noticias increíbles! Del ${startDate} al ${endDate}, todas tus compras te darán *x${settings.multiplier} PUNTOS*. ¡No te pierdas esta oportunidad única para acumular más y ganar premios! 🚀`;
    await this.sendMessage(client, body);
  } 
}