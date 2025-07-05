import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoyaltyStrategy } from './loyalty-strategy.entity';
export declare class StrategiesSeeder implements OnModuleInit {
    private strategyRepository;
    constructor(strategyRepository: Repository<LoyaltyStrategy>);
    onModuleInit(): Promise<void>;
}
