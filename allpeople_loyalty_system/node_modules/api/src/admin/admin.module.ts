// packages/api/src/admin/admin.module.ts

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { AuditModule } from '../audit/audit.module'; // <-- 1. IMPORTAR EL MÓDULO DE AUDITORÍA

@Module({
  imports: [
    TypeOrmModule.forFeature([LoyaltyStrategy, AuditLog]),
    AuditModule, // <-- 2. AÑADIRLO A LA LISTA DE IMPORTS
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}