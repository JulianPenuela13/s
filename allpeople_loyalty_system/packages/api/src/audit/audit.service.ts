// packages/api/src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { User } from '../users/user.entity';

// Interfaz para el Actor (usuario) que realiza la acción
export interface Actor {
  userId: number;
  rol: string;
  empresaId: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async logAction(actor: Actor, action: string, details?: any): Promise<void> {
    
    const logEntry = this.auditRepository.create({
      user: { id: actor.userId } as unknown as User,
      action,
      details,
      empresa_id: actor.empresaId,
    });
    
    await this.auditRepository.save(logEntry);
  }
}