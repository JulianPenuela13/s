// packages/api/src/clients/clients.controller.ts

import { Controller, Get, Param, UseGuards, Post, Body, ValidationPipe, ParseUUIDPipe, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard) // Protegemos todo el controlador con autenticación JWT
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UseGuards(RolesGuard) // El guardia de roles se aplica a este endpoint
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  create(@Body(new ValidationPipe()) createClientDto: CreateClientDto, @Req() req: any) {
    // 1. Capturamos el request con @Req() y pasamos req.user al servicio
    return this.clientsService.create(createClientDto, req.user);
  }

  @Get('summary/:documentId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  getClientSummary(@Param('documentId') documentId: string, @Req() req: any) {
    // 2. Hacemos lo mismo para obtener el resumen del cliente
    return this.clientsService.getClientSummary(documentId, req.user);
  }

  @Get(':id/unlocked-rewards')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  getUnlockedRewards(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    // 3. Y también para obtener las recompensas desbloqueadas
    return this.clientsService.getUnlockedRewards(id, req.user);
  }
}