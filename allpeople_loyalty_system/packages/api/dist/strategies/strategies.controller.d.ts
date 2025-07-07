import { StrategiesService } from './strategies.service';
import { UpdateStrategySettingsDto } from './dto/update-strategy-settings.dto';
export declare class StrategiesController {
    private readonly strategiesService;
    constructor(strategiesService: StrategiesService);
    getStrategies(req: any): Promise<import("../loyalty-engine/loyalty-strategy.entity").LoyaltyStrategy[]>;
    toggleStrategy(id: string, isActive: boolean, req: any): Promise<{
        success: boolean;
        newState: boolean;
    }>;
    updateStrategySettings(id: string, updateDto: UpdateStrategySettingsDto, req: any): Promise<{
        success: boolean;
    }>;
    getAuditLogs(req: any): Promise<import("../audit/audit-log.entity").AuditLog[]>;
}
