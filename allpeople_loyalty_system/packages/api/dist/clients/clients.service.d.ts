import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { ClientProgress } from '../loyalty-engine/client-progress.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Actor } from '../audit/actor.interface';
export interface ClientSummary {
    id: string;
    document_id: string;
    full_name: string;
    phone_number: string;
    created_at: Date;
    total_points: number;
}
export declare class ClientsService {
    private clientsRepository;
    private pointsRepository;
    private strategyRepository;
    private progressRepository;
    private unlockedRewardRepo;
    private eventEmitter;
    constructor(clientsRepository: Repository<Client>, pointsRepository: Repository<PointsTransaction>, strategyRepository: Repository<LoyaltyStrategy>, progressRepository: Repository<ClientProgress>, unlockedRewardRepo: Repository<UnlockedReward>, eventEmitter: EventEmitter2);
    create(createClientDto: CreateClientDto, actor: Actor): Promise<Client>;
    findOne(id: string, actor: Actor): Promise<Client>;
    getClientSummary(documentId: string, actor: Actor): Promise<ClientSummary>;
    findOneByPhone(phone: string, actor: Actor): Promise<Client | null>;
    getClientProgressSummary(clientId: string, actor: Actor): Promise<{
        strategy_name: string;
        current_step: number;
        target_step: any;
    }[]>;
    getUnlockedRewards(clientId: string, actor: Actor): Promise<UnlockedReward[]>;
    findOneByDocument(documentId: string, actor: Actor): Promise<Client | null>;
}
