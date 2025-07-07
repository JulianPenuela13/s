// packages/api/src/whatsapp/whatsapp.controller.ts

import { Controller, Post, Body, Get, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import { ClientsService } from '../clients/clients.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Repository } from 'typeorm';
import { Actor } from '../audit/actor.interface';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly clientsService: ClientsService,
    // Inyectamos el repositorio de Empresa para buscar por número de Twilio
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  @Get('test')
  testEndpoint() {
    this.logger.log('¡El endpoint de prueba /whatsapp/test FUE LLAMADO CORRECTAMENTE!');
    return { success: true, message: 'La conexión ngrok -> NestJS funciona perfectamente.' };
  }

  @Post('incoming')
  async handleIncomingMessage(@Body() body: any, @Res() res: Response) {
    const fromNumberWithPrefix = body.From || '';
    const toTwilioNumberWithPrefix = body.To || '';
    const messageBody = body.Body?.toLowerCase().trim() || '';
    
    // Limpiamos los números de teléfono para tener solo los dígitos
    const fromNumber = fromNumberWithPrefix.replace(/\D/g, '');
    const toTwilioNumber = toTwilioNumberWithPrefix.replace(/\D/g, '');
    
    this.logger.log(`Incoming message to Twilio# ${toTwilioNumber} from ${fromNumber}`);

    // 1. Identificamos la empresa dueña del número de Twilio
    const empresa = await this.empresaRepository.findOneBy({ twilio_phone_number: toTwilioNumber });

    if (!empresa) {
      this.logger.error(`Mensaje recibido en un número de Twilio no asignado: ${toTwilioNumber}`);
      // Respondemos OK a Twilio para que no siga intentando, pero no hacemos nada.
      return res.status(200).send();
    }

    // Creamos un "actor" falso para pasar a los servicios. No hay un usuario logueado,
    // pero sí sabemos a qué empresa pertenece la acción.
    const actor: Actor = { empresaId: empresa.id, rol: 'SYSTEM', userId: 0 };

    // 2. Buscamos al cliente por su teléfono DENTRO de la empresa identificada
    const client = await this.clientsService.findOneByPhone(fromNumber, actor);

    if (!client) {
      this.logger.warn(`Cliente con teléfono ${fromNumber} no encontrado para la empresa #${empresa.id}`);
      await this.whatsappService.sendMessage(fromNumberWithPrefix, 'Hola! No te encontramos en nuestro sistema. Asegúrate de estar registrado con este número de WhatsApp.');
      return res.status(200).send();
    }

    const clientFirstName = client.full_name.split(' ')[0];

    // 3. Todas las llamadas a los servicios ahora pasan el 'actor' para el contexto correcto
    if (messageBody === 'puntos' || messageBody === 'saldo') {
      const summary = await this.clientsService.getClientSummary(client.document_id, actor);
      const reply = `¡Hola ${clientFirstName}! Tu saldo actual es de *${summary.total_points}* puntos.`;
      await this.whatsappService.sendMessage(fromNumberWithPrefix, reply);

    } else if (messageBody === 'progreso') {
      const progressSummary = await this.clientsService.getClientProgressSummary(client.id, actor);
      
      if (!progressSummary || progressSummary.length === 0) {
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

    res.status(200).send();
  }
}