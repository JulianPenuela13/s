import { Repository } from 'typeorm';
import { Redemption } from './redemption.entity';
import { CreateRedemptionDto } from './dto/create-redemption.dto';
import { ClientsService } from '../clients/clients.service';
import { RewardsService } from '../rewards/rewards.service';
export declare class RedemptionsService {
    private readonly redemptionsRepository;
    private readonly clientsService;
    private readonly rewardsService;
    constructor(redemptionsRepository: Repository<Redemption>, clientsService: ClientsService, rewardsService: RewardsService);
    create(createRedemptionDto: CreateRedemptionDto, empresaId: number): Promise<Redemption>;
    findAll(empresaId: number): Promise<Redemption[]>;
    findOne(id: string, empresaId: number): Promise<Redemption>;
}
