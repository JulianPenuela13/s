// packages/api/src/admin/admin.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Repository } from 'typeorm';
import { AuditLog } from '../audit/audit-log.entity';
import { AuditService } from '../audit/audit.service';
import { Actor } from '../audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(LoyaltyStrategy)
    private strategyRepository: Repository<LoyaltyStrategy>,
    @InjectRepository(AuditLog) 
    private auditLogRepository: Repository<AuditLog>,
    private auditService: AuditService,
  ) {}

  getStrategies() {
    return this.strategyRepository.find({ order: { name: 'ASC' } });
  }

  // --- MÉTODO CORREGIDO ---
  async toggleStrategy(id: string, isActive: boolean, actor: Actor) {
    // 1. Buscamos la estrategia PRIMERO para obtener su nombre y asegurarnos de que existe.
    const strategy = await this.strategyRepository.findOneBy({ id });
    if (!strategy) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada.`);
    }

    // 2. Actualizamos el estado en la base de datos.
    await this.strategyRepository.update(id, { is_active: isActive });

    // 3. Registramos el log con el nombre de la estrategia.
    await this.auditService.logAction(actor, 'STRATEGY_TOGGLE', { 
        strategyName: strategy.name, 
        isActive 
    });

    return { success: true };
  }

  // --- MÉTODO CORREGIDO ---
  async updateStrategySettings(id: string, settings: any, actor: Actor) {
    // 1. Buscamos la estrategia PRIMERO.
    const strategy = await this.strategyRepository.findOneBy({ id });
    if (!strategy) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada.`);
    }

    const newSettings = { ...strategy.settings, ...settings };
    await this.strategyRepository.update(id, { settings: newSettings });

    // 2. Registramos el log con el nombre.
    await this.auditService.logAction(actor, 'STRATEGY_SETTINGS_UPDATE', { 
        strategyName: strategy.name, 
        newSettings 
    });

    return { success: true };
  }

  getAuditLogs() {
    return this.auditLogRepository.find({
        relations: ['user'],
        order: { created_at: 'DESC' },
        take: 100,
    });
  }
}