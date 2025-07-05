import { Empresa } from '../empresas/empresa.entity';
export declare enum UserRole {
    ADMIN = "admin",
    SUPERVISOR = "supervisor",
    CASHIER = "cashier"
}
export declare class User {
    id: string;
    email: string;
    password_hash: string;
    role: UserRole;
    full_name: string;
    empresa_id: number;
    empresa: Empresa;
    created_at: Date;
    hashPassword(): Promise<void>;
}
