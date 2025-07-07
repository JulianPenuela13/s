import { RewardType } from '../reward.entity';
export declare class CreateRewardDto {
    name: string;
    type?: RewardType;
    description?: string;
    cost_in_points: number;
    stock?: number;
    is_active?: boolean;
}
