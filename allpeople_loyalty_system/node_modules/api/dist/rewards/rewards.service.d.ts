import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
export declare class RewardsService {
    private rewardsRepository;
    constructor(rewardsRepository: Repository<Reward>);
    create(createRewardDto: CreateRewardDto, empresaId: number): Promise<Reward>;
    findAll(empresaId: number): Promise<Reward[]>;
    findOne(id: string, empresaId: number): Promise<Reward>;
    update(id: string, updateRewardDto: UpdateRewardDto, empresaId: number): Promise<Reward>;
    remove(id: string, empresaId: number): Promise<void>;
}
