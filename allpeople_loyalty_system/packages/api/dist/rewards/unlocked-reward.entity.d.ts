import { Client } from '../clients/client.entity';
import { Reward } from './reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class UnlockedReward {
    id: string;
    client: Client;
    reward: Reward;
    unlocked_at: Date;
    empresa: Empresa;
    empresa_id: number;
    strategy: LoyaltyStrategy;
}
