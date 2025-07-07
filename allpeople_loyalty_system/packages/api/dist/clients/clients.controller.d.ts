import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createClientDto: CreateClientDto, req: any): Promise<import("./client.entity").Client>;
    getClientSummary(documentId: string, req: any): Promise<import("./clients.service").ClientSummary>;
    getUnlockedRewards(id: string, req: any): Promise<import("../rewards/unlocked-reward.entity").UnlockedReward[]>;
}
