// packages/api/src/strategies/strategies.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Repository } from 'typeorm';
import { AuditLog } from '../audit/audit-log.entity';
import { AuditService } from '../audit/audit.service';
import { Actor } from '../audit/actor.interface';
import { UpdateStrategySettingsDto } from './dto/update-strategy-settings.dto';

@Injectable()
export class StrategiesService { // <-- 1. Nombre de clase corregido
  constructor(
    @InjectRepository(LoyaltyStrategy)
    private strategyRepository: Repository<LoyaltyStrategy>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private auditService: AuditService,
  ) {}

  // 2. Todos los métodos ahora reciben 'actor'
  getStrategies(actor: Actor) {
    // 3. Y usan 'actor.empresaId' para filtrar la búsqueda
    return this.strategyRepository.find({
      where: { empresa_id: actor.empresaId },
      order: { name: 'ASC' },
    });
  }

  async findAll(actor: Actor): Promise<LoyaltyStrategy[]> {
    return this.strategyRepository.find({
      where: { empresa_id: actor.empresaId },
      order: { id: 'ASC' },
    });
  }

  private async findOne(id: string, actor: Actor): Promise<LoyaltyStrategy> {
    const strategy = await this.strategyRepository.findOneBy({ id: id, empresa_id: actor.empresaId });
    if (!strategy) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada en su empresa.`);
    }
    return strategy;
  }


  async toggleStrategy(id: string, isActive: boolean, actor: Actor) {
    // Reutilizamos el método seguro 'findOne' para verificar la existencia
    const strategy = await this.findOne(id, actor);

    await this.strategyRepository.update(id, { is_active: isActive });

    await this.auditService.logAction(actor, 'STRATEGY_TOGGLE', {
      strategyName: strategy.name,
      isActive,
    });

    return { success: true, newState: isActive };
  }

  async updateStrategySettings(id: string, updateDto: UpdateStrategySettingsDto, actor: Actor) {
    const empresaId = actor.empresaId;

    const strategy = await this.strategyRepository.findOneBy({ id, empresa_id: empresaId });
    if (!strategy) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada en su empresa.`);
    }
    
    // Fusionamos los settings existentes con los nuevos
    const newSettings = { ...strategy.settings, ...updateDto.settings };
    
    await this.strategyRepository.update({ id, empresa_id: empresaId }, { settings: newSettings });

    await this.auditService.logAction(actor, 'STRATEGY_SETTINGS_UPDATE', {
      strategyName: strategy.name,
      newSettings,
    });

    return { success: true };
  }

  getAuditLogs(actor: Actor) {
    // Los logs de auditoría también deben ser filtrados por empresa
    return this.auditLogRepository.find({
      where: { empresa_id: actor.empresaId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }
}