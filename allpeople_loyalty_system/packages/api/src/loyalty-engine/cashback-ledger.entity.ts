// packages/api/src/loyalty-engine/cashback-ledger.entity.ts

// packages/api/src/loyalty-engine/cashback-ledger.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';

@Entity('cashback_ledger')
export class CashbackLedger {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => Purchase)
  purchase: Purchase;

  // Positivo para ganar, negativo para usar/redimir
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount_change: number;

  @Column()
  reason: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}