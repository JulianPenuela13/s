import { Client } from '../clients/client.entity';
import { LoyaltyStrategy } from './loyalty-strategy.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
export declare class ClientProgress {
    id: string;
    client: Client;
    strategy: LoyaltyStrategy;
    empresa: Empresa;
    empresa_id: number;
    progress_value: number;
}
