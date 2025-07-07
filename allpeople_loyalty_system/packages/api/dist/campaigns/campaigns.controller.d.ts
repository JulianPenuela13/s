import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    announceCampaign(req: any): Promise<{
        message: string;
    }>;
}
