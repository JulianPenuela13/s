import { Client } from '../clients/client.entity';
import { Reward } from './reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Empresa } from '../empresas/empresa.entity';
export declare class UnlockedReward {
    id: string;
    client: Client;
    reward: Reward;
    unlocked_at: Date;
    empresa_id: number;
    empresa: Empresa;
    strategy: LoyaltyStrategy;
}
