// packages/api/src/campaigns/campaigns.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
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
  async announceCampaign() {
    return this.campaignsService.announcePointsCampaign();
  }
}