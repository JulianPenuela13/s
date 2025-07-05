// packages/api/src/clients/clients.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { ClientsService } from './clients.service'; // Importar
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { ClientsController } from './clients.controller';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { ClientProgress } from '../loyalty-engine/client-progress.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, PointsTransaction, LoyaltyStrategy, ClientProgress, UnlockedReward,])],
  providers: [ClientsService], // Añadir
  controllers: [ClientsController],
  exports: [ClientsService], // Añadir para que otros módulos lo usen
})
export class ClientsModule {}