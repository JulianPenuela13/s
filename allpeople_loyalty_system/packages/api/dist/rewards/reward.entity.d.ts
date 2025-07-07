import { Empresa } from '../empresas/entities/empresa.entity';
export declare enum RewardType {
    STANDARD = "standard",
    SECRET = "secret"
}
export declare class Reward {
    id: string;
    name: string;
    description: string;
    type: RewardType;
    cost_in_points: number;
    stock: number;
    is_active: boolean;
    empresa: Empresa;
    empresa_id: number;
}
