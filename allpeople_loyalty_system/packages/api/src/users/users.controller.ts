// packages/api/src/users/users.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, ValidationPipe, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.entity';
import { Actor } from '../audit/actor.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Todas las operaciones de este controlador requieren ser ADMIN
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.usersService.create(createUserDto, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Req() req) {
    // Le pasamos el 'actor' (req.user) al servicio
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    // 2. Pasamos el actor para asegurar que solo pueda ver usuarios de su propia empresa
    const actor = req.user as Actor;
    return this.usersService.findOne(id, actor);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
    @Req() req: any
  ) {
    const actor = req.user as Actor;
    return this.usersService.update(id, updateUserDto, actor);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const actor = req.user as Actor;
    return this.usersService.remove(id, actor);
  }
}