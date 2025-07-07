import { Client } from '../clients/client.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class Purchase {
    id: string;
    client: Client;
    amount: number;
    empresa: Empresa;
    empresa_id: number;
    transaction_at: Date;
}
