// packages/api/src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert, Index, ManyToOne, JoinColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Empresa } from '../empresas/entities/empresa.entity';

export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  CASHIER = 'cashier',
  SUPER_ADMIN = 'super_admin', // La definición oficial es en minúsculas
}

@Entity('users')
@Index(['email', 'empresa_id'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole; // La columna en la base de datos se llama 'role' (con 'e')

  @Column()
  full_name: string;

  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column()
  empresa_id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password_hash) {
      this.password_hash = await bcrypt.hash(this.password_hash, 10);
    }
  }
}