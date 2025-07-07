// packages/api/src/purchases/purchases.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';
import { LoyaltyEngineService } from '../loyalty-engine/loyalty-engine.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Client } from '../clients/client.entity';
import { Actor } from '../audit/actor.interface'; // 1. Importamos la interfaz Actor

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchasesRepository: Repository<Purchase>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private loyaltyEngineService: LoyaltyEngineService,
  ) {}

  // 2. El método ahora recibe el 'actor' que registra la compra
  async createPurchase(dto: CreatePurchaseDto, actor: Actor) {
    const empresaId = actor.empresaId;

    // 3. Buscamos al cliente por su documento DENTRO DE LA EMPRESA CORRECTA
    const client = await this.clientsRepository.findOneBy({
      document_id: dto.client_document_id,
      empresa_id: empresaId, // <-- FILTRO DE SEGURIDAD AÑADIDO
    });

    if (!client) {
      throw new NotFoundException(`No se puede registrar la compra porque el cliente con cédula ${dto.client_document_id} no existe en su empresa.`);
    }

    // 4. Creamos la compra y la asignamos a la empresa correcta
    const purchase = this.purchasesRepository.create({
      client: client,
      amount: dto.amount,
      empresa_id: empresaId, // <-- Asignamos la empresa a la compra
    });
    const savedPurchase = await this.purchasesRepository.save(purchase);

    // 5. Procesamos la compra en el motor de lealtad, PASANDO EL ACTOR
    const benefits = await this.loyaltyEngineService.processPurchase(
      savedPurchase,
      actor, // <-- Pasamos el actor para que el motor sepa qué reglas aplicar
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