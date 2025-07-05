// packages/api/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuditModule],
  providers: [UsersService],
  exports: [UsersService], // Exportamos para que AuthModule lo pueda usar
  controllers: [UsersController],
})
export class UsersModule {}