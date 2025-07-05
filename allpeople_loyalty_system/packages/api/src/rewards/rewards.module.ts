// packages/api/src/rewards/rewards.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './reward.entity';
import { Redemption } from './redemption.entity';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { UnlockedReward } from './unlocked-reward.entity';
import { AuditModule } from '../audit/audit.module';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reward, Redemption, UnlockedReward, LoyaltyStrategy]), AuditModule,],
  providers: [RewardsService],
  controllers: [RewardsController],
  exports: [RewardsService],
})
export class RewardsModule {}