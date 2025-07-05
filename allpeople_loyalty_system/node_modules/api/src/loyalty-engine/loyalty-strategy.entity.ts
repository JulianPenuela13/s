// packages/api/src/loyalty-engine/loyalty-strategy.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { ManyToOne, JoinColumn } from 'typeorm';


@Entity('loyalty_strategies')
export class LoyaltyStrategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
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
  settings: any; // Aquí guardaremos las reglas específicas de cada estrategia
}