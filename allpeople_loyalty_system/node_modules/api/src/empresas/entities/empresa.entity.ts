// src/empresas/entities/empresa.entity.ts

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre_empresa: string;

  @Column()
  plan_suscripcion: string;

  @Column({ default: 'activa' })
  estado_suscripcion: string;

  @CreateDateColumn()
  fecha_creacion: Date;
}