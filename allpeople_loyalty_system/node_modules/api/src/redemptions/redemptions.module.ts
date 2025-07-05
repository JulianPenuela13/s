// packages/api/src/redemptions/redemptions.module.ts
import { Module } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { RedemptionsController } from './redemptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Redemption } from '../rewards/redemption.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { ClientsModule } from '../clients/clients.module';
import { RewardsModule } from '../rewards/rewards.module'; // Ruta corregida
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Redemption, UnlockedReward, PointsTransaction]),
    ClientsModule,
    RewardsModule,
    WhatsappModule,
  ],
  controllers: [RedemptionsController],
  providers: [RedemptionsService],
})
export class RedemptionsModule {}