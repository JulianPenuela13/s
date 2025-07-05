// packages/api/src/purchases/purchases.controller.ts
import { Controller, Post, Body, ValidationPipe, UseGuards } from '@nestjs/common'; // Añadir UseGuards
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Importar el Guard

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @UseGuards(JwtAuthGuard) // <--- AÑADIR ESTA LÍNEA
  @Post()
  create(@Body(new ValidationPipe()) createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.createPurchase(createPurchaseDto);
  }
}