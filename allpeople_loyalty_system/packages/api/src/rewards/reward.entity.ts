// packages/api/src/rewards/reward.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Definimos los tipos de recompensa que pueden existir
export enum RewardType {
  STANDARD = 'standard', // Visible para todos
  SECRET = 'secret',     // Oculta hasta ser desbloqueada
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
}