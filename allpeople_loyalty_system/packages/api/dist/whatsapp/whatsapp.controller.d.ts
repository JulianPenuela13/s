import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import { ClientsService } from '../clients/clients.service';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Repository } from 'typeorm';
export declare class WhatsappController {
    private readonly whatsappService;
    private readonly clientsService;
    private readonly empresaRepository;
    private readonly logger;
    constructor(whatsappService: WhatsappService, clientsService: ClientsService, empresaRepository: Repository<Empresa>);
    testEndpoint(): {
        success: boolean;
        message: string;
    };
    handleIncomingMessage(body: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
