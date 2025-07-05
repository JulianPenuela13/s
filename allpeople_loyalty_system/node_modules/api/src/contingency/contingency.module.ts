// packages/api/src/contingency/contingency.module.ts

// packages/api/src/contingency/contingency.module.ts

import { Module } from '@nestjs/common';
import { ContingencyController } from './contingency.controller';
import { ContingencyService } from './contingency.service';
import { LoyaltyEngineModule } from '../loyalty-engine/loyalty-engine.module';
import { ClientsModule } from '../clients/clients.module';
import { PurchasesModule } from '../purchases/purchases.module';

@Module({
  imports: [LoyaltyEngineModule, ClientsModule, PurchasesModule],
  controllers: [ContingencyController],
  providers: [ContingencyService],
})
export class ContingencyModule {}