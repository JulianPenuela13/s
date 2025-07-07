import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Purchase } from '../purchases/purchase.entity';
import { PointsTransaction } from './points-transaction.entity';
import { LoyaltyStrategy } from './loyalty-strategy.entity';
import { CashbackLedger } from './cashback-ledger.entity';
import { ClientProgress } from './client-progress.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { Reward } from '../rewards/reward.entity';
import { Actor } from '../audit/actor.interface';
export declare class LoyaltyEngineService {
    private pointsRepository;
    private strategyRepository;
    private cashbackRepository;
    private progressRepository;
    private unlockedRewardRepository;
    private rewardsRepository;
    private eventEmitter;
    private readonly logger;
    constructor(pointsRepository: Repository<PointsTransaction>, strategyRepository: Repository<LoyaltyStrategy>, cashbackRepository: Repository<CashbackLedger>, progressRepository: Repository<ClientProgress>, unlockedRewardRepository: Repository<UnlockedReward>, rewardsRepository: Repository<Reward>, eventEmitter: EventEmitter2);
    processPurchase(purchase: Purchase, actor: Actor): Promise<any>;
    private handleProgressBasedStrategies;
    private unlockRewardForClient;
    private unlockRandomReward;
    private saveBenefits;
    private getClientTotalPoints;
    private savePointsTransaction;
    private saveCashbackTransaction;
}
