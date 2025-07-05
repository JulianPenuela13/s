import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
export interface Actor {
    userId: string;
    email: string;
    role: string;
}
export declare class AuditService {
    private auditRepository;
    constructor(auditRepository: Repository<AuditLog>);
    logAction(actor: Actor, action: string, details?: any): Promise<void>;
}
