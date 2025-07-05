// packages/api/src/redemptions/redemptions.controller.ts
import { Controller, Post, Body, UseGuards, Req, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { CreateRedemptionDto } from './dto/create-redemption.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Actor } from '../audit/audit.service'; // Importamos el tipo Actor

@Controller('redemptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @HttpCode(HttpStatus.CREATED)
  redeem(@Body(new ValidationPipe()) createRedemptionDto: CreateRedemptionDto, @Req() req) {
    // Obtenemos el actor (el payload del token) del objeto request
    const actor = req.user as Actor;
    return this.redemptionsService.redeem(createRedemptionDto, actor);
  }
}