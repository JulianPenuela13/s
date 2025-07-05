// packages/api/src/reports/reports.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

// La ruta base debe ser '/admin/reports'
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('dynamic-tables')
  getDynamicTables() {
    return this.reportsService.getDynamicReportTables();
  }
}