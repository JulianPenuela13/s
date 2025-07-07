// packages/api/src/clients/client.entity.ts

import { Purchase } from '../purchases/purchase.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';

@Entity('clients')
// 1. Creamos un índice único compuesto. Un mismo 'document_id' puede existir,
//    pero solo una vez por cada 'empresa_id'.
@Index(['document_id', 'empresa_id'], { unique: true })
// 2. Hacemos lo mismo para el número de teléfono.
@Index(['phone_number', 'empresa_id'], { unique: true })
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 3. Quitamos la restricción 'unique: true' de aquí porque ya la maneja el @Index de arriba.
  @Column()
  document_id: string;

  @Column()
  full_name: string;

  // 4. Quitamos la restricción 'unique: true' de aquí también.
  @Column()
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