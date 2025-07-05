import { TwilioService } from '../twilio/twilio.service';
import { ClientsService } from '../clients/clients.service';
import { RewardsService } from '../rewards/rewards.service';
export declare class WhatsappController {
    private readonly twilioService;
    private readonly clientsService;
    private readonly rewardsService;
    private readonly logger;
    constructor(twilioService: TwilioService, clientsService: ClientsService, rewardsService: RewardsService);
    handleIncomingMessage(body: any): Promise<void>;
}
