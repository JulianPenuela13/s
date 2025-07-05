import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';
import { Empresa } from '../empresas/empresa.entity';
export declare class CashbackLedger {
    id: number;
    client: Client;
    purchase: Purchase;
    amount_change: number;
    reason: string;
    empresa_id: number;
    empresa: Empresa;
    created_at: Date;
}
