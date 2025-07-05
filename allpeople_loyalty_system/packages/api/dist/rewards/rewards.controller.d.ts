import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    create(createRewardDto: CreateRewardDto, req: any): Promise<import("./reward.entity").Reward>;
    findAll(req: any): Promise<import("./reward.entity").Reward[]>;
    findOne(id: string, req: any): Promise<import("./reward.entity").Reward>;
    update(id: string, updateRewardDto: UpdateRewardDto, req: any): Promise<import("./reward.entity").Reward>;
    remove(id: string, req: any): Promise<void>;
}
