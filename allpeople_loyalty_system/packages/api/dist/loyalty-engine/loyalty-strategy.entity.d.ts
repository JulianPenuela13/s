import { Empresa } from '../empresas/entities/empresa.entity';
export declare class LoyaltyStrategy {
    id: string;
    key: string;
    name: string;
    is_active: boolean;
    empresa: Empresa;
    empresa_id: number;
    settings: any;
}
