import { DataSource } from 'typeorm';
import { Redemption } from '../rewards/redemption.entity';
import { CreateRedemptionDto } from './dto/create-redemption.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { ClientsService } from '../clients/clients.service';
import { RewardsService } from '../rewards/rewards.service';
import { Actor } from '../audit/actor.interface';
export declare class RedemptionsService {
    private readonly dataSource;
    private readonly clientsService;
    private readonly rewardsService;
    private readonly whatsappService;
    private readonly logger;
    constructor(dataSource: DataSource, clientsService: ClientsService, rewardsService: RewardsService, whatsappService: WhatsappService);
    redeem(dto: CreateRedemptionDto, actor: Actor): Promise<Redemption>;
}
