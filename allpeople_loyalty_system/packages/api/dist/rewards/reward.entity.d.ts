import { Empresa } from '../empresas/empresa.entity';
export declare class Reward {
    id: string;
    name: string;
    description: string;
    points_cost: number;
    empresa_id: number;
    empresa: Empresa;
    created_at: Date;
}
