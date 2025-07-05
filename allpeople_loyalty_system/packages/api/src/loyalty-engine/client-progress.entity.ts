// packages/api/src/loyalty-engine/client-progress.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Client } from '../clients/client.entity';
import { LoyaltyStrategy } from './loyalty-strategy.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { JoinColumn } from 'typeorm';


@Entity('client_progress')
@Unique(['client', 'strategy']) // Un cliente solo puede tener una línea de progreso por estrategia
export class ClientProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => LoyaltyStrategy)
  strategy: LoyaltyStrategy;

  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column()
  empresa_id: number;

  @Column({ type: 'int', default: 0 })
  progress_value: number;
}