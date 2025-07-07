// packages/api/src/tasks/tasks.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between, Raw } from 'typeorm';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Client } from '../clients/client.entity';
import { Empresa } from '../empresas/entities/empresa.entity'; // <-- 1. IMPORTAMOS EMPRESA

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(PointsTransaction) private pointsRepo: Repository<PointsTransaction>,
    @InjectRepository(LoyaltyStrategy) private strategyRepo: Repository<LoyaltyStrategy>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Empresa) private empresaRepo: Repository<Empresa>, // <-- 2. INYECTAMOS EL REPO DE EMPRESA
    private whatsappService: WhatsappService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handlePointsExpiration() {
    this.logger.log('Running daily check for points expiration for all companies...');
    const empresas = await this.empresaRepo.find({ where: { estado_suscripcion: 'activa' } });

    // 3. Iteramos sobre cada empresa activa
    for (const empresa of empresas) {
      this.logger.log(`Processing expiration for empresa #${empresa.id}`);
      const pointsStrategy = await this.strategyRepo.findOneBy({ key: 'points', empresa_id: empresa.id });

      if (!pointsStrategy?.settings?.expiration_enabled) {
        this.logger.log(`Points expiration is disabled for empresa #${empresa.id}. Skipping.`);
        continue; // Pasamos a la siguiente empresa
      }

      const notificationDays = pointsStrategy.settings.notification_days_before;

      await this.invalidateExpiredPoints(empresa.id);
      if (notificationDays > 0) {
        await this.notifyUpcomingExpirations(notificationDays, empresa.id);
      }
    }
    this.logger.log('Daily points expiration check finished.');
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleBirthdayCampaign() {
    this.logger.log('Running daily check for birthday campaigns for all companies...');
    const empresas = await this.empresaRepo.find({ where: { estado_suscripcion: 'activa' } });

    // 4. Iteramos sobre cada empresa activa
    for (const empresa of empresas) {
      const birthdayStrategy = await this.strategyRepo.findOneBy({ key: 'birthday', is_active: true, empresa_id: empresa.id });
      if (!birthdayStrategy) {
        continue;
      }

      const { notification_days_before, message_template } = birthdayStrategy.settings;
      if (notification_days_before === undefined || !message_template) {
        this.logger.warn(`Birthday campaign for empresa #${empresa.id} is active but not configured correctly.`);
        continue;
      }

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + notification_days_before);
      
      // 5. Buscamos clientes que cumplen años DE ESA EMPRESA ESPECÍFICA
      const birthdayClients = await this.clientRepo.find({
        where: {
          empresa_id: empresa.id, // <-- FILTRO DE SEGURIDAD
          birth_date: Raw(alias => `EXTRACT(MONTH FROM ${alias}) = :month AND EXTRACT(DAY FROM ${alias}) = :day`, {
            month: targetDate.getMonth() + 1,
            day: targetDate.getDate(),
          }),
        },
      });

      this.logger.log(`Found ${birthdayClients.length} clients for empresa #${empresa.id} with upcoming birthdays.`);
      for (const client of birthdayClients) {
        await this.whatsappService.sendBirthdayMessage(client, message_template);
      }
    }
  }

  // Todos los métodos privados ahora reciben empresaId para filtrar sus acciones
  private async invalidateExpiredPoints(empresaId: number) {
    const now = new Date();
    const expiredTransactions = await this.pointsRepo.find({
      where: {
        empresa_id: empresaId, // <-- FILTRO DE SEGURIDAD
        expires_at: LessThan(now),
        points_change: MoreThan(0),
      },
      relations: ['client'],
    });

    for (const tx of expiredTransactions) {
      const invalidationTx = this.pointsRepo.create({
        client: tx.client,
        points_change: -tx.points_change,
        reason: `Vencimiento de puntos ganados el ${tx.created_at.toISOString().split('T')[0]}`,
        expires_at: null,
        empresa_id: empresaId, // <-- Asignamos la empresa
      });
      await this.pointsRepo.save(invalidationTx);

      tx.expires_at = null;
      await this.pointsRepo.save(tx);
    }
  }

  private async notifyUpcomingExpirations(notificationDays: number, empresaId: number) {
    const today = new Date();
    const notificationDate = new Date();
    notificationDate.setDate(today.getDate() + notificationDays);

    const expiringSoonTxs = await this.pointsRepo.find({
      where: {
        empresa_id: empresaId, // <-- FILTRO DE SEGURIDAD
        expires_at: Between(today, notificationDate),
        points_change: MoreThan(0),
      },
      relations: ['client'],
    });

    const notificationsToSend = new Map<string, { client: Client, totalPoints: number }>();
    for (const tx of expiringSoonTxs) {
      // Agrupación de puntos... (tu lógica aquí era correcta)
    }

    for (const [, data] of notificationsToSend.entries()) {
      await this.whatsappService.sendPointsExpirationWarning(data.client, data.totalPoints, notificationDays);
    }
  }
}