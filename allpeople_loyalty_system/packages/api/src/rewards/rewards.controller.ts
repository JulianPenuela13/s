// packages/api/src/rewards/rewards.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, ParseUUIDPipe, Req, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { Actor } from '../audit/actor.interface';

@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  create(@Body(new ValidationPipe()) createRewardDto: CreateRewardDto, @Req() req: any) {
    const actor = req.user as Actor;
    // --- CORRECCIÓN ---
    // Pasamos solo el DTO y el actor, que es lo que el servicio espera.
    return this.rewardsService.create(createRewardDto, actor);
  }

  @Get()
  findAll(@Query('context') context: string, @Req() req: any) {
    // Aquí es correcto pasar context y req.user
    return this.rewardsService.findAll(req.user, context);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.rewardsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body(new ValidationPipe()) updateRewardDto: UpdateRewardDto, @Req() req) {
    const actor = req.user as Actor;
    return this.rewardsService.update(id, updateRewardDto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const actor = req.user as Actor;
    return this.rewardsService.remove(id, actor);
  }
}