import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Purchase } from '../purchases/purchase.entity';
import { Reward } from '../rewards/reward.entity';
import { PointsTransaction } from '../points/points-transaction.entity';
import { Rule } from '../rules/rule.entity';
import { UnlockedReward } from '../unlocked-rewards/unlocked-reward.entity';
interface LoyaltyEngineResult {
    pointsEarned: number;
    unlockedRewards: Reward[];
}
export declare class LoyaltyEngineService {
    private ruleRepository;
    private rewardRepository;
    private unlockedRewardRepository;
    private pointsTransactionRepository;
    private readonly logger;
    constructor(ruleRepository: Repository<Rule>, rewardRepository: Repository<Reward>, unlockedRewardRepository: Repository<UnlockedReward>, pointsTransactionRepository: Repository<PointsTransaction>);
    processPurchase(purchase: Purchase, client: Client): Promise<LoyaltyEngineResult>;
    private findApplicableRules;
    private executeRule;
    private unlockRewardForClient;
    private recordPointsTransaction;
}
export {};
