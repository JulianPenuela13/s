// packages/api/src/loyalty-engine/cashback-ledger.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';
import { Empresa } from '../empresas/entities/empresa.entity'; // <-- 1. IMPORTAMOS EMPRESA

@Entity('cashback_ledger')
export class CashbackLedger {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Client)
  client: Client;

  // Hacemos que la compra sea opcional, ya que se puede añadir cashback manualmente
  @ManyToOne(() => Purchase, { nullable: true })
  purchase: Purchase;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount_change: number;

  @Column()
  reason: string;

  // --- AÑADIMOS LA CONEXIÓN FUNDAMENTAL CON EMPRESA ---
  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column()
  empresa_id: number;
  // --- FIN DE LA CONEXIÓN ---

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}