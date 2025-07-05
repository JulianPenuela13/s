import { User } from '../users/user.entity';
import { Empresa } from '../empresas/empresa.entity';
export declare class AuditLog {
    id: number;
    user: User;
    action: string;
    details: any;
    empresa_id: number;
    empresa: Empresa;
    created_at: Date;
}
