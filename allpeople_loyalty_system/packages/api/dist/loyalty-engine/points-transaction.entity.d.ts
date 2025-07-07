import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';
import { Redemption } from '../rewards/redemption.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class PointsTransaction {
    id: number;
    client: Client;
    purchase: Purchase;
    redemption: Redemption;
    points_change: number;
    base_points: number;
    bonus_points: number;
    reason: string;
    empresa: Empresa;
    empresa_id: number;
    created_at: Date;
    expires_at: Date | null;
}
