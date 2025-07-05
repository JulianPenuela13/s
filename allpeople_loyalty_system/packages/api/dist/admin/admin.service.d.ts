import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Repository } from 'typeorm';
import { AuditLog } from '../audit/audit-log.entity';
import { AuditService } from '../audit/audit.service';
import { Actor } from '../audit/audit.service';
export declare class AdminService {
    private strategyRepository;
    private auditLogRepository;
    private auditService;
    constructor(strategyRepository: Repository<LoyaltyStrategy>, auditLogRepository: Repository<AuditLog>, auditService: AuditService);
    getStrategies(): Promise<LoyaltyStrategy[]>;
    toggleStrategy(id: string, isActive: boolean, actor: Actor): Promise<{
        success: boolean;
    }>;
    updateStrategySettings(id: string, settings: any, actor: Actor): Promise<{
        success: boolean;
    }>;
    getAuditLogs(): Promise<AuditLog[]>;
}
