// packages/api/src/purchases/dto/create-purchase.dto.ts

// packages/api/src/purchases/dto/create-purchase.dto.ts

import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  @IsNotEmpty()
  client_document_id: string;

  @IsNumber()
  @Min(1)
  amount: number;
}