// packages/api/src/redemptions/dto/create-redemption.dto.ts
import { IsUUID } from 'class-validator';
export class CreateRedemptionDto {
  @IsUUID()
  clientId: string;
  @IsUUID()
  rewardId: string;
}