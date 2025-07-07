// packages/api/src/clients/clients.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { ClientsService } from './clients.service'; 
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { ClientsController } from './clients.controller';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { ClientProgress } from '../loyalty-engine/client-progress.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, PointsTransaction, LoyaltyStrategy, ClientProgress, UnlockedReward,])],
  providers: [ClientsService], 
  controllers: [ClientsController],
  exports: [ClientsService], 
})
export class ClientsModule {}