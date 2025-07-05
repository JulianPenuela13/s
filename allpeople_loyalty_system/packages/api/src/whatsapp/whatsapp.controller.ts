// packages/api/src/whatsapp/whatsapp.controller.ts

import { Controller, Post, Body, Get, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import { ClientsService } from '../clients/clients.service';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly clientsService: ClientsService,
  ) {}

  @Get('test')
  testEndpoint() {
    this.logger.log('¡El endpoint de prueba /whatsapp/test FUE LLAMADO CORRECTAMENTE!');
    return { success: true, message: 'La conexión ngrok -> NestJS funciona perfectamente.' };
  }

  @Post('incoming')
  async handleIncomingMessage(@Body() body: any, @Res() res: Response) {
    const messageBody = body.Body?.toLowerCase().trim() || '';
    const fromNumberWithPrefix = body.From || '';
    
    // CORRECCIÓN DEFINITIVA: Limpiamos CUALQUIER símbolo que no sea un dígito
    const fromNumber = fromNumberWithPrefix.replace(/\D/g, '');
    
    this.logger.log(`Received message "${messageBody}" from ${fromNumberWithPrefix}`);

    const client = await this.clientsService.findOneByPhone(fromNumber);

    if (!client) {
      this.logger.warn(`Client with phone ${fromNumber} not found.`);
      await this.whatsappService.sendMessage(fromNumberWithPrefix, 'Hola! No te encontramos en nuestro sistema. Asegúrate de estar registrado con este número de WhatsApp.');
      // Siempre debemos responder a Twilio para que no siga intentando
      return res.status(200).send();
    }

    const clientFirstName = client.full_name.split(' ')[0];

    if (messageBody === 'puntos' || messageBody === 'saldo') {
      const summary = await this.clientsService.getClientSummary(client.document_id);
      const reply = `¡Hola ${clientFirstName}! Tu saldo actual es de *${summary.total_points}* puntos.`;
      await this.whatsappService.sendMessage(fromNumberWithPrefix, reply);

    } else if (messageBody === 'progreso') {
      const progressSummary = await this.clientsService.getClientProgressSummary(client.id);
      
      if (progressSummary.length === 0) {
        await this.whatsappService.sendMessage(fromNumberWithPrefix, `¡Hola ${clientFirstName}! Actualmente no estás participando en ninguna campaña de progreso por compras.`);
      } else {
        let reply = `¡Hola ${clientFirstName}! Este es tu progreso actual:\n`;
        progressSummary.forEach(p => {
          reply += `\n- Para *${p.strategy_name}*, llevas *${p.current_step} de ${p.target_step}* compras.`;
        });
        await this.whatsappService.sendMessage(fromNumberWithPrefix, reply);
      }

    } else {
      const reply = `¡Hola ${clientFirstName}! Envía la palabra *puntos* para ver tu saldo o *progreso* para ver tu avance en nuestras campañas.`;
      await this.whatsappService.sendMessage(fromNumberWithPrefix, reply);
    }

    // Al final de toda la lógica, respondemos a Twilio con un 200 OK
    res.status(200).send();
  }
}