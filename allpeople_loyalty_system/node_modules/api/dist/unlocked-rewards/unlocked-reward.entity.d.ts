import { Empresa } from '../empresas/empresa.entity';
import { Client } from '../clients/client.entity';
import { Reward } from '../rewards/reward.entity';
export declare class UnlockedReward {
    id: string;
    client_id: string;
    reward_id: string;
    is_redeemed: boolean;
    empresa_id: number;
    empresa: Empresa;
    client: Client;
    reward: Reward;
    created_at: Date;
}
