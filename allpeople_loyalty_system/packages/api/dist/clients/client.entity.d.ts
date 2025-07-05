import { Empresa } from '../empresas/empresa.entity';
import { Purchase } from '../purchases/purchase.entity';
export declare class Client {
    id: string;
    full_name: string;
    phone_number: string;
    document_id: string;
    points_balance: number;
    empresa_id: number;
    empresa: Empresa;
    purchases: Purchase[];
    created_at: Date;
}
