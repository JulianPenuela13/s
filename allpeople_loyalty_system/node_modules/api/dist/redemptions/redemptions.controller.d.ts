import { RedemptionsService } from './redemptions.service';
import { CreateRedemptionDto } from './dto/create-redemption.dto';
export declare class RedemptionsController {
    private readonly redemptionsService;
    constructor(redemptionsService: RedemptionsService);
    create(createRedemptionDto: CreateRedemptionDto, req: any): Promise<import("./redemption.entity").Redemption>;
    findAll(req: any): Promise<import("./redemption.entity").Redemption[]>;
    findOne(id: string, req: any): Promise<import("./redemption.entity").Redemption>;
}
