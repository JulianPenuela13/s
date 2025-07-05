// packages/api/src/contingency/contingency.controller.ts

import { Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContingencyService } from './contingency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('admin/contingency')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ContingencyController {
  constructor(private readonly contingencyService: ContingencyService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' es el nombre del campo que enviaremos desde el frontend
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.contingencyService.processContingencyFile(file.buffer);
  }
}