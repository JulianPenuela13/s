// packages/api/src/admin/admin.controller.ts
import { Controller, Get, Patch, Param, Body, UseGuards, ParseUUIDPipe, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../users/user.entity';
import { UpdateStrategySettingsDto } from './dto/update-strategy-settings.dto';
import { Actor } from '../audit/audit.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('strategies')
  getStrategies() {
    return this.adminService.getStrategies();
  }

  @Patch('strategies/:id/toggle')
  toggleStrategy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('is_active') isActive: boolean,
    @Req() req, // Obtenemos el objeto de la petición
  ) {
    const actor = req.user as Actor; // Extraemos el usuario que está logueado
    return this.adminService.toggleStrategy(id, isActive, actor);
  }

  @Patch('strategies/:id/settings')
  updateStrategySettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateStrategySettingsDto,
    @Req() req,
  ) {
    const actor = req.user as Actor;
    return this.adminService.updateStrategySettings(id, updateDto.settings, actor);
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}