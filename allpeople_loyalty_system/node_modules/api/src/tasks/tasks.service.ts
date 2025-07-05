// packages/api/src/tasks/tasks.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, MoreThan, Raw } from 'typeorm';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Client } from '../clients/client.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(PointsTransaction)
    private pointsRepo: Repository<PointsTransaction>,
    @InjectRepository(LoyaltyStrategy)
    private strategyRepo: Repository<LoyaltyStrategy>,
    @InjectRepository(Client) // <-- Necesitamos acceso a los clientes
    private clientRepo: Repository<Client>,
    private whatsappService: WhatsappService,
  ) {}

  // Esta anotación hace que el método se ejecute todos los días a la 1 AM.
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handlePointsExpiration() {
    this.logger.log('Running daily check for points expiration...');

    const pointsStrategy = await this.strategyRepo.findOneBy({ key: 'points' });
    // Si la estrategia de puntos no existe o no tiene la expiración activada, no hacemos nada.
    if (!pointsStrategy?.settings?.expiration_enabled) {
      this.logger.log('Points expiration is disabled. Skipping task.');
      return;
    }

    const notificationDays = pointsStrategy.settings.notification_days_before;

    // 1. Invalidar puntos ya vencidos
    await this.invalidateExpiredPoints();

    // 2. Notificar sobre puntos que están por vencer (si está configurado)
    if (notificationDays > 0) {
      await this.notifyUpcomingExpirations(notificationDays);
    }

    this.logger.log('Daily points expiration check finished.');
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM) // Se ejecuta todos los días a las 8 AM
  async handleBirthdayCampaign() {
    this.logger.log('Running daily check for birthday campaigns...');

    const birthdayStrategy = await this.strategyRepo.findOneBy({ key: 'birthday', is_active: true });
    // Si la estrategia no está activa, no hacemos nada.
    if (!birthdayStrategy) {
      this.logger.log('Birthday campaign is disabled. Skipping task.');
      return;
    }

    const { notification_days_before, message_template } = birthdayStrategy.settings;
    if (!notification_days_before || !message_template) {
      this.logger.warn('Birthday campaign is active but not configured correctly.');
      return;
    }

    // Calculamos la fecha objetivo
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + notification_days_before);
    const targetMonth = targetDate.getMonth() + 1; // getMonth() es 0-11
    const targetDay = targetDate.getDate();

    // Buscamos clientes cuyo cumpleaños coincida con el mes y día objetivo
    const birthdayClients = await this.clientRepo.find({
      where: {
        birth_date: Raw(alias => `EXTRACT(MONTH FROM ${alias}) = :month AND EXTRACT(DAY FROM ${alias}) = :day`, {
          month: targetMonth,
          day: targetDay,
        }),
      },
    });

    this.logger.log(`Found ${birthdayClients.length} clients with upcoming birthdays.`);

    for (const client of birthdayClients) {
      await this.whatsappService.sendBirthdayMessage(client, message_template);
    }
  }

  private async invalidateExpiredPoints() {
    const now = new Date();
    // Buscamos transacciones de puntos positivos cuya fecha de vencimiento ya pasó
    const expiredTransactions = await this.pointsRepo.find({
      where: {
        expires_at: LessThan(now),
        points_change: MoreThan(0), // Solo nos importan los puntos ganados
      },
      relations: ['client'],
    });

    for (const tx of expiredTransactions) {
      this.logger.log(`Invalidating ${tx.points_change} points for client ${tx.client.id} from transaction ${tx.id}`);

      // Creamos una nueva transacción negativa para anular los puntos
      const invalidationTx = this.pointsRepo.create({
        client: tx.client,
        points_change: -tx.points_change,
        reason: `Vencimiento de puntos ganados el ${tx.created_at.toISOString().split('T')[0]}`,
        expires_at: null, // Esta transacción de anulación no vence
      });
      await this.pointsRepo.save(invalidationTx);

      // Marcamos la transacción original como "vencida" para no procesarla de nuevo
      // (Una forma simple es poner su fecha de vencimiento en el pasado lejano o null)
      tx.expires_at = null; // O una fecha específica si se prefiere
      await this.pointsRepo.save(tx);
    }
  }

  private async notifyUpcomingExpirations(notificationDays: number) {
    const today = new Date();
    const notificationDate = new Date();
    notificationDate.setDate(today.getDate() + notificationDays);

    // Buscamos puntos que vencerán exactamente en la fecha de notificación
    const expiringSoonTxs = await this.pointsRepo.find({
        where: {
            expires_at: Between(today, notificationDate),
            points_change: MoreThan(0),
        },
        relations: ['client']
    });

    // Agrupamos los puntos por cliente para enviar una sola notificación
    const notificationsToSend = new Map<string, { client: Client, totalPoints: number }>();
    for (const tx of expiringSoonTxs) {
        const existing = notificationsToSend.get(tx.client.id);
        if (existing) {
            existing.totalPoints += tx.points_change;
        } else {
            notificationsToSend.set(tx.client.id, {
                client: tx.client,
                totalPoints: tx.points_change,
            });
        }
    }

    // Enviamos las notificaciones
    for (const [clientId, data] of notificationsToSend.entries()) {
        this.logger.log(`Notifying client ${clientId} about ${data.totalPoints} points expiring in ${notificationDays} days.`);
        // Aquí iría la llamada al WhatsappService
        await this.whatsappService.sendPointsExpirationWarning(data.client, data.totalPoints, notificationDays);
    }
  }
}