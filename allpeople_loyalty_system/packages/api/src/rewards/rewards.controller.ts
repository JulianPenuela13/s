// packages/api/src/rewards/rewards.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, ParseUUIDPipe, Req, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { Actor } from '../audit/audit.service';

@Controller('rewards')
@UseGuards(JwtAuthGuard) // TODAS las rutas requieren estar logueado, pero no todas requieren ser admin
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @Roles(UserRole.ADMIN) // Solo un admin puede crear
  @UseGuards(RolesGuard)
  create(@Body(new ValidationPipe()) createRewardDto: CreateRewardDto, @Req() req: any) {
    const actor = req.user as Actor;
    return this.rewardsService.create(createRewardDto, actor, req.user);
  }

  @Get()
  // CORRECCIÓN: Quitamos el @Roles(UserRole.ADMIN) de aquí.
  // Ahora, cualquier usuario logueado (admin O cajero) puede ver la lista de recompensas.
  findAll(@Query('context') context?: string, @Req() req: any) {
    return this.rewardsService.findAll(context, req.user);
  }

  @Get(':id')
  // Esta ruta también la puede ver un cajero
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.rewardsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN) // Solo un admin puede editar
  @UseGuards(RolesGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body(new ValidationPipe()) updateRewardDto: UpdateRewardDto, @Req() req) {
    const actor = req.user as Actor;
    return this.rewardsService.update(id, updateRewardDto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Solo un admin puede borrar
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const actor = req.user as Actor;
    return this.rewardsService.remove(id, actor);
  }
}