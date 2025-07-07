import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Repository } from 'typeorm';
import { AuditLog } from '../audit/audit-log.entity';
import { AuditService } from '../audit/audit.service';
import { Actor } from '../audit/actor.interface';
import { UpdateStrategySettingsDto } from './dto/update-strategy-settings.dto';
export declare class StrategiesService {
    private strategyRepository;
    private auditLogRepository;
    private auditService;
    constructor(strategyRepository: Repository<LoyaltyStrategy>, auditLogRepository: Repository<AuditLog>, auditService: AuditService);
    getStrategies(actor: Actor): Promise<LoyaltyStrategy[]>;
    findAll(actor: Actor): Promise<LoyaltyStrategy[]>;
    private findOne;
    toggleStrategy(id: string, isActive: boolean, actor: Actor): Promise<{
        success: boolean;
        newState: boolean;
    }>;
    updateStrategySettings(id: string, updateDto: UpdateStrategySettingsDto, actor: Actor): Promise<{
        success: boolean;
    }>;
    getAuditLogs(actor: Actor): Promise<AuditLog[]>;
}
