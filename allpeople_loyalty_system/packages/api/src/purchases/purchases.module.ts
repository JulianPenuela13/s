// packages/api/src/purchases/purchases.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './purchase.entity';
import { PurchasesService } from './purchases.service'; // Importar
import { PurchasesController } from './purchases.controller'; // Importar
import { ClientsModule } from '../clients/clients.module'; // Importar
import { LoyaltyEngineModule } from '../loyalty-engine/loyalty-engine.module'; // Importar
import { Client } from '../clients/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, Client]),
    ClientsModule, // Añadir
    LoyaltyEngineModule, // Añadir
  ],
  providers: [PurchasesService], // Añadir
  controllers: [PurchasesController], // Añadir
  exports: [PurchasesService],
})
export class PurchasesModule {}