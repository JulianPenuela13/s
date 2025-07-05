// packages/api/src/loyalty-engine/points-transaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';
import { Redemption } from '../rewards/redemption.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { JoinColumn } from 'typeorm';

@Entity('points_transactions')
export class PointsTransaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => Purchase, { nullable: true })
  purchase: Purchase;

  @ManyToOne(() => Redemption, { nullable: true })
  redemption: Redemption;

  // El total de puntos que cambiaron en esta transacción (puede ser negativo)
  @Column({ type: 'int' })
  points_change: number;

  // --- NUEVAS COLUMNAS PARA DETALLE ---
  @Column({ type: 'int', default: 0 })
  base_points: number; // Puntos ganados por la compra normal

  @Column({ type: 'int', default: 0 })
  bonus_points: number; // Puntos extra ganados por campañas

  @Column()
  reason: string;

  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column()
  empresa_id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date | null;
}