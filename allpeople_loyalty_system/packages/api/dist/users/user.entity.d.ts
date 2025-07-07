import { Empresa } from '../empresas/entities/empresa.entity';
export declare enum UserRole {
    ADMIN = "admin",
    SUPERVISOR = "supervisor",
    CASHIER = "cashier",
    SUPER_ADMIN = "super_admin"
}
export declare class User {
    id: string;
    email: string;
    password_hash: string;
    role: UserRole;
    full_name: string;
    empresa: Empresa;
    empresa_id: number;
    created_at: Date;
    hashPassword(): Promise<void>;
}
