// packages/api/src/loyalty-engine/loyalty-strategy.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';

@Entity('loyalty_strategies')
// 1. Creamos un índice único compuesto. Una misma 'key' (ej: 'points') puede existir,
//    pero solo una vez por cada 'empresa_id'.
@Index(['key', 'empresa_id'], { unique: true })
export class LoyaltyStrategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 2. Quitamos la restricción 'unique: true' de aquí porque ya la maneja el @Index de arriba.
  @Column()
  key: string;

  @Column()
  name: string;

  @Column({ default: false })
  is_active: boolean;

  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column()
  empresa_id: number;

  @Column({ type: 'jsonb', nullable: true })
  settings: any;
}