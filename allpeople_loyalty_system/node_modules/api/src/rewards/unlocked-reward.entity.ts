// packages/api/src/rewards/unlocked-reward.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Reward } from './reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { JoinColumn } from 'typeorm';

@Entity('unlocked_rewards')
export class UnlockedReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => Reward)
  reward: Reward;

  @CreateDateColumn({ type: 'timestamptz' })
  unlocked_at: Date;

  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column()
  empresa_id: number;

  @ManyToOne(() => LoyaltyStrategy, { nullable: true, onDelete: 'SET NULL' })
  strategy: LoyaltyStrategy;
}