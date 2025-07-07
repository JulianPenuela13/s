// packages/api/src/loyalty-engine/loyalty-engine.module.ts

// packages/api/src/loyalty-engine/loyalty-engine.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTransaction } from './points-transaction.entity';
import { LoyaltyStrategy } from './loyalty-strategy.entity';
import { LoyaltyEngineService } from './loyalty-engine.service';

import { CashbackLedger } from './cashback-ledger.entity';
import { ClientProgress } from './client-progress.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity'; // <-- 1. IMPORTAR LA NUEVA ENTIDAD
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { Reward } from '../rewards/reward.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointsTransaction,
      LoyaltyStrategy,
      CashbackLedger,
      ClientProgress,
      UnlockedReward, // <-- 2. AÑADIRLA A LA LISTA
      Reward,

    ]),
  ],
  providers: [LoyaltyEngineService],
  exports: [LoyaltyEngineService],
})
export class LoyaltyEngineModule {}