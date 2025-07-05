import { Client } from '../clients/client.entity';
import { LoyaltyStrategy } from './loyalty-strategy.entity';
export declare class ClientProgress {
    id: string;
    client: Client;
    strategy: LoyaltyStrategy;
    progress_value: number;
}
