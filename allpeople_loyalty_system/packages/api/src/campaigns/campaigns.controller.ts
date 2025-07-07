// packages/api/src/campaigns/campaigns.controller.ts
import { Controller, Post, UseGuards, Req } from '@nestjs/common'; // <-- 1. Añade Req
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('admin/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post('announce')
  async announceCampaign(@Req() req: any) { // <-- 2. Capturamos el request
    // 3. Pasamos el objeto 'user' completo (que tiene la empresaId) al servicio
    return this.campaignsService.announcePointsCampaign(req.user);
  }
}