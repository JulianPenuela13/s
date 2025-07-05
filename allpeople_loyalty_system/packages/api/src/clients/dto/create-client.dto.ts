// packages/api/src/clients/dto/create-client.dto.ts
import { IsString, IsNotEmpty, Length, IsOptional, IsDateString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  document_id: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 13)
  phone_number: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;
  
}