import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsService {
    private clientsRepository;
    constructor(clientsRepository: Repository<Client>);
    findOneByPhoneAcrossTenants(phoneNumber: string): Promise<Client | null>;
    create(createClientDto: CreateClientDto, empresaId: number): Promise<Client>;
    findAll(empresaId: number): Promise<Client[]>;
    findOne(id: string, empresaId: number): Promise<Client>;
    update(id: string, updateClientDto: UpdateClientDto, empresaId: number): Promise<Client>;
    remove(id: string, empresaId: number): Promise<void>;
}
