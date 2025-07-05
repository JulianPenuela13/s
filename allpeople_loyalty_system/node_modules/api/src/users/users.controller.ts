// packages/api/src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, ValidationPipe, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, User } from './user.entity';
import { Actor } from '../audit/audit.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body(new ValidationPipe()) createUserDto: CreateUserDto, @Req() req) {
    const actor = req.user as Actor; // El usuario que está haciendo la petición
    return this.usersService.create(createUserDto, actor);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
    @Req() req
  ) {
    const actor = req.user as Actor;
    return this.usersService.update(id, updateUserDto, actor);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const actor = req.user as Actor;
    return this.usersService.remove(id, actor);
  }
}