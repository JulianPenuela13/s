import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';
import { Redemption } from '../redemptions/redemption.entity';
import { Empresa } from '../empresas/empresa.entity';
export declare class PointsTransaction {
    id: number;
    client: Client;
    purchase: Purchase;
    redemption: Redemption;
    points_change: number;
    base_points: number;
    bonus_points: number;
    reason: string;
    empresa_id: number;
    empresa: Empresa;
    created_at: Date;
    expires_at: Date | null;
}
