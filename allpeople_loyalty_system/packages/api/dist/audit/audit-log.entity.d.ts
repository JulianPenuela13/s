import { User } from '../users/user.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class AuditLog {
    id: number;
    user: User;
    action: string;
    details: any;
    empresa: Empresa;
    empresa_id: number;
    created_at: Date;
}
