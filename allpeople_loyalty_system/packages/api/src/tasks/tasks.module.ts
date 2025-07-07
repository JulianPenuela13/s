// packages/api/src/tasks/tasks.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { Client } from '../clients/client.entity';
import { Empresa } from '../empresas/entities/empresa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointsTransaction, LoyaltyStrategy, Client, Empresa,]),
    WhatsappModule, // Importamos el módulo de WhatsApp para poder usar su servicio
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}