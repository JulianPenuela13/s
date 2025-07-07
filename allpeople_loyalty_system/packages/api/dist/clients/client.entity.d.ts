import { Purchase } from '../purchases/purchase.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class Client {
    id: string;
    document_id: string;
    full_name: string;
    phone_number: string;
    birth_date: Date | null;
    purchases: Purchase[];
    empresa: Empresa;
    empresa_id: number;
    created_at: Date;
}
