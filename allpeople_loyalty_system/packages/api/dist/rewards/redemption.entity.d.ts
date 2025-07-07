import { Client } from '../clients/client.entity';
import { Reward } from './reward.entity';
import { User } from '../users/user.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class Redemption {
    id: string;
    client: Client;
    reward: Reward;
    user: User;
    strategy: LoyaltyStrategy;
    points_used: number;
    empresa: Empresa;
    empresa_id: number;
    created_at: Date;
}
