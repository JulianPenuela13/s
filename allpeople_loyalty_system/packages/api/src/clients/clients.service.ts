// packages/api/src/clients/clients.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Client } from './client.entity';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { ClientProgress } from '../loyalty-engine/client-progress.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Actor } from '../audit/actor.interface'; // Importamos la interfaz Actor

export interface ClientSummary {
  id: string;
  document_id: string;
  full_name: string;
  phone_number: string;
  created_at: Date;
  total_points: number;
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(PointsTransaction)
    private pointsRepository: Repository<PointsTransaction>,
    @InjectRepository(LoyaltyStrategy)
    private strategyRepository: Repository<LoyaltyStrategy>,
    @InjectRepository(ClientProgress)
    private progressRepository: Repository<ClientProgress>,
    @InjectRepository(UnlockedReward)
    private unlockedRewardRepo: Repository<UnlockedReward>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createClientDto: CreateClientDto, actor: Actor): Promise<Client> {
    const empresaId = actor.empresaId;
    const { document_id, phone_number } = createClientDto;

    // 1. Verificamos si el cliente ya existe DENTRO DE LA MISMA EMPRESA
    const existingClient = await this.clientsRepository.findOne({
      where: [
        { document_id, empresa_id: empresaId },
        { phone_number, empresa_id: empresaId },
      ],
    });

    if (existingClient) {
      throw new ConflictException('Ya existe un cliente con el mismo documento o teléfono en su empresa.');
    }
    
    // Limpiamos el número de teléfono
    if (createClientDto.phone_number) {
      createClientDto.phone_number = String(createClientDto.phone_number).replace(/\D/g, '');
    }

    // 2. Creamos el cliente ASIGNÁNDOLO A LA EMPRESA del actor
    const newClient = this.clientsRepository.create({
      ...createClientDto,
      empresa_id: empresaId,
    });
    const savedClient = await this.clientsRepository.save(newClient);

    this.eventEmitter.emit('client.created', savedClient);
    return savedClient;
  }
  
  

  async findOne(id: string, actor: Actor): Promise<Client> {
    // 3. Buscamos por ID Y por empresa_id para seguridad
    const client = await this.clientsRepository.findOneBy({ id: id, empresa_id: actor.empresaId });
    if (!client) {
      throw new NotFoundException(`Cliente con ID "${id}" no encontrado en su empresa.`);
    }
    return client;
  }

  async getClientSummary(documentId: string, actor: Actor): Promise<ClientSummary> {
    // 4. Buscamos por documento Y por empresa_id
    const client = await this.clientsRepository.findOneBy({ document_id: documentId, empresa_id: actor.empresaId });
    if (!client) {
      throw new NotFoundException(`Cliente con cédula ${documentId} no encontrado en su empresa.`);
    }

    // 5. Calculamos los puntos solo para este cliente
    const pointsResult = await this.pointsRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.points_change)', 'total_points')
      .where('tx.clientId = :clientId', { clientId: client.id })
      .andWhere('tx.empresa_id = :empresaId', { empresaId: actor.empresaId }) // <-- Filtro de seguridad
      .getRawOne();

    const totalPoints = parseInt(pointsResult?.total_points, 10) || 0;

    return {
      ...client,
      total_points: totalPoints,
    };
  }

  async findOneByPhone(phone: string, actor: Actor): Promise<Client | null> {
    // 6. Buscamos por teléfono Y por empresa_id
    return this.clientsRepository.findOneBy({ phone_number: phone, empresa_id: actor.empresaId });
  }

  async getClientProgressSummary(clientId: string, actor: Actor) {
    // 7. Verificamos primero que el cliente pertenezca a la empresa del actor
    await this.findOne(clientId, actor);
    
    const empresaId = actor.empresaId;

    const purchaseCountStrategies = await this.strategyRepository
      .createQueryBuilder('strategy')
      .where('strategy.is_active = :isActive', { isActive: true })
      .andWhere('strategy.empresa_id = :empresaId', { empresaId }) // <-- Filtro de seguridad
      .andWhere(
        "(strategy.settings ->> 'required_purchases' IS NOT NULL OR strategy.settings ->> 'trigger_on_purchase_count' IS NOT NULL)"
      )
      .getMany();

    if (purchaseCountStrategies.length === 0) {
      return [];
    }

    const clientProgress = await this.progressRepository.find({
      where: {
        client: { id: clientId },
        strategy: { id: In(purchaseCountStrategies.map(s => s.id)) },
        empresa_id: empresaId, // <-- Filtro de seguridad
      },
      relations: ['strategy'],
    });

    return purchaseCountStrategies.map(strategy => {
      const progress = clientProgress.find(p => p.strategy?.id === strategy.id);
      return {
        strategy_name: strategy.name,
        current_step: progress ? progress.progress_value : 0,
        target_step: strategy.settings.required_purchases || strategy.settings.trigger_on_purchase_count,
      };
    });
  }

  async getUnlockedRewards(clientId: string, actor: Actor) {
    // 8. Verificamos que el cliente pertenezca a la empresa
    await this.findOne(clientId, actor);

    return this.unlockedRewardRepo.find({
      where: { 
          client: { id: clientId },
          empresa_id: actor.empresaId, // <-- Filtro de seguridad
      },
      relations: ['reward'],
    });
  }

  async findOneByDocument(documentId: string, actor: Actor): Promise<Client | null> {
    // 9. Buscamos por documento Y por empresa_id
    return this.clientsRepository.findOneBy({ document_id: documentId, empresa_id: actor.empresaId });
  }
}