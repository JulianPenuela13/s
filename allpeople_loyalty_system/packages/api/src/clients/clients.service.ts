// packages/api/src/clients/clients.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { Client } from './client.entity';
import { PointsTransaction } from '../loyalty-engine/points-transaction.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { ClientProgress } from '../loyalty-engine/client-progress.entity';
import { UnlockedReward } from '../rewards/unlocked-reward.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

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

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const { document_id, phone_number } = createClientDto;
    const existingClient = await this.clientsRepository.findOne({
        where: [{ document_id }, { phone_number }],
    });
    
    if (createClientDto.phone_number) {
        createClientDto.phone_number = String(createClientDto.phone_number).replace(/\D/g, '');
    }

    const newClient = this.clientsRepository.create(createClientDto);
    const savedClient = await this.clientsRepository.save(newClient);

    this.eventEmitter.emit('client.created', savedClient);
    return savedClient;
  }
  
  async findOne(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOneBy({ id });
    if (!client) {
      throw new NotFoundException(`Cliente con ID "${id}" no encontrado.`);
    }
    return client;
  }

  async getClientSummary(documentId: string): Promise<ClientSummary> {
    const client = await this.clientsRepository.findOneBy({ document_id: documentId });
    if (!client) {
      throw new NotFoundException(`Cliente con cédula ${documentId} no encontrado.`);
    }

    const pointsResult = await this.pointsRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.points_change)', 'total_points')
      .where('tx.clientId = :clientId', { clientId: client.id })
      .getRawOne();

    const totalPoints = parseInt(pointsResult?.total_points, 10) || 0;

    return {
      ...client,
      total_points: totalPoints,
    };
  }

  async findOneByPhone(phone: string): Promise<Client | null> {
    return this.clientsRepository.findOneBy({ phone_number: phone });
  }

  async getClientProgressSummary(clientId: string) {
    // Usamos el QueryBuilder que es más potente para buscar en campos JSON
    const purchaseCountStrategies = await this.strategyRepository
      .createQueryBuilder('strategy')
      .where('strategy.is_active = :isActive', { isActive: true })
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
        strategy: { id: In(purchaseCountStrategies.map(s => s.id)) }
      },
      relations: ['strategy'],
    });

    return purchaseCountStrategies.map(strategy => {
      const progress = clientProgress.find(p => p.strategy?.id === strategy.id);
      const current_step = progress ? progress.progress_value : 0;
      const target_step = strategy.settings.required_purchases || strategy.settings.trigger_on_purchase_count;
      
      return {
        strategy_name: strategy.name,
        current_step,
        target_step,
      };
    });
  }

  // El nuevo método, en su lugar correcto y marcado como 'async'
  async getUnlockedRewards(clientId: string) {
    return this.unlockedRewardRepo.find({
      where: { client: { id: clientId } },
      relations: ['reward'], // 'reward' es el nombre de la propiedad en la entidad UnlockedReward
    });
  }

  async findOneByDocument(documentId: string): Promise<Client | null> {
  return this.clientsRepository.findOneBy({ document_id: documentId });
  }
}