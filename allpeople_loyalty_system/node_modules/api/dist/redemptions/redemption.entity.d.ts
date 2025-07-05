import { Client } from '../clients/client.entity';
import { Reward } from '../rewards/reward.entity';
import { User } from '../users/user.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Empresa } from '../empresas/empresa.entity';
export declare class Redemption {
    id: string;
    client: Client;
    reward: Reward;
    user: User;
    strategy: LoyaltyStrategy;
    empresa_id: number;
    empresa: Empresa;
    points_used: number;
    created_at: Date;
}
