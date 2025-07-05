import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Redemption } from '../redemptions/redemption.entity';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { Purchase } from '../purchases/purchase.entity';
import { CashbackLedger } from '../loyalty-engine/cashback-ledger.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
export declare class ReportsService {
    private clientsRepo;
    private redemptionsRepo;
    private pointsRepo;
    private purchaseRepository;
    private cashbackRepo;
    private unlockedRewardRepo;
    private strategyRepo;
    constructor(clientsRepo: Repository<Client>, redemptionsRepo: Repository<Redemption>, pointsRepo: Repository<PointsTransaction>, purchaseRepository: Repository<Purchase>, cashbackRepo: Repository<CashbackLedger>, unlockedRewardRepo: Repository<UnlockedReward>, strategyRepo: Repository<LoyaltyStrategy>);
    getDashboardStats(): Promise<any>;
    getDynamicReportTables(): Promise<{
        title: string;
        data: any[];
    }[]>;
}
