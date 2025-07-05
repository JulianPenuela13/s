import { Client } from '../clients/client.entity';
import { Empresa } from '../empresas/empresa.entity';
export declare class Purchase {
    id: string;
    client: Client;
    amount: number;
    empresa_id: number;
    empresa: Empresa;
    transaction_at: Date;
}
