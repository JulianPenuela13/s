import { RewardType } from '../reward.entity';
export declare class UpdateRewardDto {
    name?: string;
    description?: string;
    cost_in_points?: number;
    stock?: number;
    is_active?: boolean;
    type?: RewardType;
}
