// packages/api/src/whatsapp/whatsapp.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { ClientsModule } from '../clients/clients.module';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { NotificationListener } from './notification.listener';
import { Empresa } from '../empresas/entities/empresa.entity'; // <-- 1. IMPORTAR LA ENTIDAD EMPRESA

@Module({
  imports: [
    ClientsModule,
    // 2. AÑADIMOS LA ENTIDAD EMPRESA AQUÍ
    TypeOrmModule.forFeature([LoyaltyStrategy, Empresa]),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, NotificationListener],
  exports: [WhatsappService],
})
export class WhatsappModule {}