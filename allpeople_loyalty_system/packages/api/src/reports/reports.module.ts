// packages/api/src/reports/reports.module.ts

import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { Redemption } from '../rewards/redemption.entity';
import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';
import { CashbackLedger } from '../loyalty-engine/cashback-ledger.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointsTransaction,
      Redemption,
      Client,
      Purchase, // Añadido
      CashbackLedger, // Añadido
      UnlockedReward, // Añadido
      LoyaltyStrategy,
    ]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}