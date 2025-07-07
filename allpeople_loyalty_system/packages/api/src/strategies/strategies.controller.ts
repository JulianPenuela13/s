// packages/api/src/strategies/strategies.controller.ts

import { Controller, Get, Patch, Param, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { StrategiesService } from './strategies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { UpdateStrategySettingsDto } from './dto/update-strategy-settings.dto';
import { Actor } from '../audit/actor.interface';

@Controller('admin/strategies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}

  @Get()
  getStrategies(@Req() req: any) {
    const actor = req.user as Actor;
    // Corregido para llamar al método que sí existe: getStrategies
    return this.strategiesService.getStrategies(actor);
  }

  @Patch(':id/toggle')
  toggleStrategy(
    @Param('id') id: string,
    @Body('is_active') isActive: boolean,
    @Req() req: any,
  ) {
    const actor = req.user as Actor;
    return this.strategiesService.toggleStrategy(id, isActive, actor);
  }

  @Patch(':id/settings')
  updateStrategySettings(
    @Param('id') id: string,
    @Body() updateDto: UpdateStrategySettingsDto,
    @Req() req: any,
  ) {
    const actor = req.user as Actor;
    // Pasamos el DTO completo, no solo 'updateDto.settings'
    return this.strategiesService.updateStrategySettings(id, updateDto, actor);
  }

  @Get('audit-logs')
  getAuditLogs(@Req() req: any) {
    const actor = req.user as Actor;
    return this.strategiesService.getAuditLogs(actor);
  }
}