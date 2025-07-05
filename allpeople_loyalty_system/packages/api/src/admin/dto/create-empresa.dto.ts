import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  nombre_empresa: string;

  @IsString()
  @IsOptional()
  plan_suscripcion?: string;
}