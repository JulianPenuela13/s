// packages/api/src/rewards/dto/create-reward.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';
import { RewardType } from '../reward.entity';

export class CreateRewardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  type?: RewardType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  cost_in_points: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}