// packages/api/src/clients/client.entity.ts

import { Purchase } from '../purchases/purchase.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, OneToMany } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { ManyToOne, JoinColumn } from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  document_id: string;

  @Column()
  full_name: string;

  @Column({ unique: true })
  phone_number: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date | null;

  @OneToMany(() => Purchase, (purchase) => purchase.client)
  purchases: Purchase[];

  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column()
  empresa_id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}