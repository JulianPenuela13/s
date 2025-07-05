// packages/api/src/whatsapp/whatsapp.module.ts
// packages/api/src/whatsapp/whatsapp.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importar
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { ClientsModule } from '../clients/clients.module';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity'; // Importar
import { NotificationListener } from './notification.listener';

@Module({
  imports: [
    ClientsModule,
    TypeOrmModule.forFeature([LoyaltyStrategy]), // <-- Añadir
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, NotificationListener],
  exports: [WhatsappService],
})
export class WhatsappModule {}