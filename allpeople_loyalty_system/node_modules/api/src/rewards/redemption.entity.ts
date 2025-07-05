// packages/api/src/rewards/redemption.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Reward } from './reward.entity';
import { User } from '../users/user.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { JoinColumn } from 'typeorm';

@Entity('redemptions')
export class Redemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => Reward)
  reward: Reward;

  // El cajero que procesó el canje
  @ManyToOne(() => User)
  user: User;

  // Si el canje fue por un premio ganado, aquí guardamos qué estrategia lo otorgó.
  @ManyToOne(() => LoyaltyStrategy, { nullable: true, onDelete: 'SET NULL' })
  strategy: LoyaltyStrategy;

  @Column({ type: 'int' })
  points_used: number;

  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column()
  empresa_id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}