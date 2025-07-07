// packages/api/src/purchases/purchases.controller.ts

import { Controller, Post, Body, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todo el controlador
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER) // Solo Admins y Cajeros pueden crear compras
  create(@Body(new ValidationPipe()) createPurchaseDto: CreatePurchaseDto, @Req() req: any) {
    // 1. Capturamos el request con @Req()
    const actor = req.user; // Obtenemos el usuario/actor del token

    // 2. Pasamos el DTO y el actor al servicio
    return this.purchasesService.createPurchase(createPurchaseDto, actor);
  }
}