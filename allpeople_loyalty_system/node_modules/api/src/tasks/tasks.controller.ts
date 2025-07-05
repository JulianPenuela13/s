// packages/api/src/tasks/tasks.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos el controlador
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('run-expiration-check')
  @Roles(UserRole.ADMIN) // Solo un admin puede ejecutar esta prueba
  async runExpirationCheck() {
    // Llamamos manualmente a la función que se ejecutaría a la 1 AM
    await this.tasksService.handlePointsExpiration();
    return { message: 'La revisión de vencimiento de puntos se ha ejecutado manualmente.' };
  }
}