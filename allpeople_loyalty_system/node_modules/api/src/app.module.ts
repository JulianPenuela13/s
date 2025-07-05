// packages/api/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { typeOrmAsyncConfig } from './config/typeorm.config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ClientsModule } from './clients/clients.module';
import { PurchasesModule } from './purchases/purchases.module';
import { LoyaltyEngineModule } from './loyalty-engine/loyalty-engine.module';
import { RewardsModule } from './rewards/rewards.module';
import { RedemptionsModule } from './redemptions/redemptions.module';
import { ReportsModule } from './reports/reports.module'; // Importar
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AuditModule } from './audit/audit.module';
import { TasksModule } from './tasks/tasks.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ContingencyModule } from './contingency/contingency.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    
    // Módulos de nuestra aplicación
    UsersModule,
    AuthModule,
    AdminModule,
    ClientsModule,
    PurchasesModule,
    LoyaltyEngineModule,
    RewardsModule,
    RedemptionsModule,
    ReportsModule, // Asegúrate de que esté en la lista
    WhatsappModule,
    AuditModule,
    TasksModule,
    CampaignsModule,
    ContingencyModule,
  ],
})
export class AppModule {}