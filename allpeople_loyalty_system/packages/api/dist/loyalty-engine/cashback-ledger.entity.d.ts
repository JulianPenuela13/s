import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class CashbackLedger {
    id: number;
    client: Client;
    purchase: Purchase;
    amount_change: number;
    reason: string;
    empresa: Empresa;
    empresa_id: number;
    created_at: Date;
}
