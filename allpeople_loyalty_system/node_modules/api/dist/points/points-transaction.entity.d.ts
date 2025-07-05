import { Empresa } from '../empresas/empresa.entity';
import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';
import { Rule } from '../rules/rule.entity';
export declare class PointsTransaction {
    id: string;
    points_earned: number;
    client_id: string;
    purchase_id: string;
    rule_id: string;
    empresa_id: number;
    empresa: Empresa;
    client: Client;
    purchase: Purchase;
    rule: Rule;
    created_at: Date;
}
