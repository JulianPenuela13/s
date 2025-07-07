// src/admin/admin.module.ts

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { UsersModule } from '../users/users.module';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, LoyaltyStrategy]),
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}