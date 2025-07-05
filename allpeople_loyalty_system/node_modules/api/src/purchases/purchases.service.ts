// packages/api/src/purchases/purchases.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';
import { ClientsService } from '../clients/clients.service';
import { LoyaltyEngineService } from '../loyalty-engine/loyalty-engine.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Client } from '../clients/client.entity'; // Importamos Client

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchasesRepository: Repository<Purchase>,
    @InjectRepository(Client) // Inyectamos el repo de Client para buscar
    private clientsRepository: Repository<Client>,
    private loyaltyEngineService: LoyaltyEngineService,
  ) {}

  // CORRECCIÓN DEL ERROR 2: Cambiamos la lógica para no usar findOrCreate
  async createPurchase(dto: CreatePurchaseDto) {
    // El nuevo flujo asume que el cliente DEBE existir. Lo buscamos.
    const client = await this.clientsRepository.findOneBy({ document_id: dto.client_document_id });
    if (!client) {
        throw new NotFoundException(`No se puede registrar la compra porque el cliente con cédula ${dto.client_document_id} no existe.`);
    }

    const purchase = this.purchasesRepository.create({
      client: client,
      amount: dto.amount,
    });
    const savedPurchase = await this.purchasesRepository.save(purchase);

    const benefits = await this.loyaltyEngineService.processPurchase(
      savedPurchase,
    );

    return {
      message: 'Compra registrada y procesada exitosamente.',
      purchaseId: savedPurchase.id,
      clientId: client.id,
      clientName: client.full_name,
      benefitsAwarded: benefits,
    };
  }
}