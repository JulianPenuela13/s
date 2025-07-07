// packages/api/src/strategies/strategies.module.ts
import { Module } from '@nestjs/common';
import { StrategiesController } from './strategies.controller';
import { StrategiesService } from './strategies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoyaltyStrategy, AuditLog]),
    AuditModule,
  ],
  controllers: [StrategiesController],
  providers: [StrategiesService],
})
export class StrategiesModule {} // <-- NOMBRE CORREGIDO