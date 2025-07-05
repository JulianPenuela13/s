import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
export declare class TasksService {
    private readonly clientRepository;
    private readonly logger;
    constructor(clientRepository: Repository<Client>);
    handleCron(): void;
    handlePointsExpiration(): Promise<void>;
    handleBirthdayCron(): Promise<void>;
}
