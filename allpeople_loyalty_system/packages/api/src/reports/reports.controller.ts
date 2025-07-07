// packages/api/src/reports/reports.controller.ts

import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { Actor } from '../audit/actor.interface';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-stats')
  getDashboardStats(@Req() req: any) {
    const actor = req.user as Actor; // 1. Capturamos al actor (el admin logueado)
    return this.reportsService.getDashboardStats(actor); // 2. Se lo pasamos al servicio
  }

  @Get('dynamic-tables')
  getDynamicTables(@Req() req: any) {
    const actor = req.user as Actor; // 1. Capturamos al actor
    return this.reportsService.getDynamicReportTables(actor); // 2. Se lo pasamos al servicio
  }
}