import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { AuditService, Actor } from '../audit/audit.service';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
export declare class RewardsService {
    private rewardsRepository;
    private strategyRepository;
    private auditService;
    constructor(rewardsRepository: Repository<Reward>, strategyRepository: Repository<LoyaltyStrategy>, auditService: AuditService);
    create(createRewardDto: CreateRewardDto, actor: Actor): Promise<Reward>;
    findAll(user: Actor, context?: string): Promise<Reward[]>;
    findOne(id: string, user: Actor): Promise<Reward>;
    update(id: string, updateRewardDto: UpdateRewardDto, actor: Actor): Promise<Reward>;
    remove(id: string, actor: Actor): Promise<void>;
    decrementStock(id: string, empresaId: number): Promise<void>;
}
