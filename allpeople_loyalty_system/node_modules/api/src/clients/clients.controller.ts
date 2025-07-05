// packages/api/src/clients/clients.controller.ts

// Añadimos ParseUUIDPipe a la lista de imports
import { Controller, Get, Param, UseGuards, Post, Body, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @UseGuards(RolesGuard)
  create(@Body(new ValidationPipe()) createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get('summary/:documentId')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @UseGuards(RolesGuard)
  getClientSummary(@Param('documentId') documentId: string) {
    return this.clientsService.getClientSummary(documentId);
  }

  @Get(':id/unlocked-rewards')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @UseGuards(RolesGuard)
  getUnlockedRewards(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.getUnlockedRewards(id);
  }
}