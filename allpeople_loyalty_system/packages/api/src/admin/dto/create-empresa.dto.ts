// packages/api/src/admin/dto/create-empresa.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  nombre_empresa: string;

  @IsString()
  @IsNotEmpty()
  plan_suscripcion: string;
}