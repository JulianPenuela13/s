import { AdminService } from './admin.service';
import { UpdateStrategySettingsDto } from './dto/update-strategy-settings.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStrategies(): Promise<import("../loyalty-engine/loyalty-strategy.entity").LoyaltyStrategy[]>;
    toggleStrategy(id: string, isActive: boolean, req: any): Promise<{
        success: boolean;
    }>;
    updateStrategySettings(id: string, updateDto: UpdateStrategySettingsDto, req: any): Promise<{
        success: boolean;
    }>;
    getAuditLogs(): Promise<import("../audit/audit-log.entity").AuditLog[]>;
}
