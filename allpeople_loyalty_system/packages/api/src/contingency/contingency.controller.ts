// packages/api/src/contingency/contingency.controller.ts

import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Req } from '@nestjs/common';
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    // 1. Capturamos el request con @Req() para obtener el usuario
    const actor = req.user; // El actor contiene { userId, rol, empresaId }

    // 2. Pasamos el buffer del archivo Y el actor al servicio
    return this.contingencyService.processContingencyFile(file.buffer, actor);
  }
}