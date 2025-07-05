// packages/api/src/rewards/dto/update-reward.dto.ts
import { IsString, IsNumber, Min, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { RewardType } from '../reward.entity';

export class UpdateRewardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost_in_points?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
    is_active?: boolean;
    
  @IsEnum(RewardType)
  @IsOptional()
  type?: RewardType;  
}