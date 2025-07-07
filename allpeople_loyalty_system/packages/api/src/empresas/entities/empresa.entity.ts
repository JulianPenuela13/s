// src/empresas/entities/empresa.entity.ts

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

  export enum WhatsappProvider {
  TWILIO = 'twilio',
  WPPCONNECT = 'wppconnect',
  NONE = 'none',
}

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

  @Column({
    type: 'enum',
    enum: WhatsappProvider,
    default: WhatsappProvider.NONE,
  })
  whatsapp_provider: WhatsappProvider;

  @Column({ type: 'varchar', nullable: true, unique: true })
  wpp_session_name: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  twilio_phone_number: string | null;

  @CreateDateColumn()
  fecha_creacion: Date;
}