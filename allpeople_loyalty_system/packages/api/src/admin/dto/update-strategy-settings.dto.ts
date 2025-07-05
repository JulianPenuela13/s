// packages/api/src/admin/dto/update-strategy-settings.dto.ts
import { IsObject } from 'class-validator';

export class UpdateStrategySettingsDto {
  @IsObject()
  settings: any;
}