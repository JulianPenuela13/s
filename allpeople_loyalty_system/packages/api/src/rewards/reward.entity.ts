// packages/api/src/rewards/reward.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity'; // <-- 1. IMPORTAMOS LA ENTIDAD EMPRESA

export enum RewardType {
  STANDARD = 'standard',
  SECRET = 'secret',
}

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RewardType,
    default: RewardType.STANDARD,
  })
  type: RewardType;

  @Column({ type: 'int' })
  cost_in_points: number;

  @Column({ type: 'int', default: -1 })
  stock: number;

  @Column({ default: true })
  is_active: boolean;

 
  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column()
  empresa_id: number;
  
}