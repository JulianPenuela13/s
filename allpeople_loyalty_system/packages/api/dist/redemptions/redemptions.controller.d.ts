import { RedemptionsService } from './redemptions.service';
import { CreateRedemptionDto } from './dto/create-redemption.dto';
export declare class RedemptionsController {
    private readonly redemptionsService;
    constructor(redemptionsService: RedemptionsService);
    redeem(createRedemptionDto: CreateRedemptionDto, req: any): Promise<import("../rewards/redemption.entity").Redemption>;
}
