// packages/api/src/contingency/contingency.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as Papa from 'papaparse';
import { ClientsService } from '../clients/clients.service';
import { PurchasesService } from '../purchases/purchases.service';
import { CreateClientDto } from '../clients/dto/create-client.dto';
import { Actor } from '../audit/actor.interface'; // 1. Importamos la interfaz Actor

@Injectable()
export class ContingencyService {
  private readonly logger = new Logger(ContingencyService.name);

  constructor(
    private readonly clientsService: ClientsService,
    private readonly purchasesService: PurchasesService,
  ) {}

  // 2. El método ahora recibe el 'actor' que sube el archivo
  async processContingencyFile(fileBuffer: Buffer, actor: Actor) {
    const fileContent = fileBuffer.toString('utf-8');
    const results = { processed: 0, failed: 0, errors: [] as string[] };

    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    for (const row of parsed.data) {
      try {
        if (typeof row !== 'object' || row === null || Object.values(row).every(v => !v)) {
          continue;
        }

        const { Cedula, Valor, NombreCompleto, Telefono, FechaNacimiento } = row as any;
        
        if (!Cedula || !Valor) {
          throw new BadRequestException(`Fila inválida, faltan datos de Cedula o Valor: ${JSON.stringify(row)}`);
        }

        // 3. Buscamos al cliente DENTRO DE LA EMPRESA DEL ACTOR
        let client = await this.clientsService.findOneByDocument(Cedula, actor);

        if (!client) {
          this.logger.log(`Cliente con documento ${Cedula} no encontrado en empresa ${actor.empresaId}. Intentando crear...`);
          if (!NombreCompleto || !Telefono) {
            throw new BadRequestException(`Cliente nuevo con cédula ${Cedula} no tiene NombreCompleto y Telefono.`);
          }
          
          const cleanTelefono = String(Telefono).replace(/\D/g, '');

          const newClientData: CreateClientDto = {
            document_id: Cedula,
            full_name: NombreCompleto,
            phone_number: cleanTelefono,
          };

          if (FechaNacimiento) {
            // ... (tu lógica para formatear la fecha es correcta y se mantiene)
            const parts = String(FechaNacimiento).split('/');
            if (parts.length === 3) {
              const [day, month, year] = parts;
              newClientData.birth_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          }
          
          // 4. Creamos el nuevo cliente, PASANDO EL ACTOR para que se asigne a la empresa correcta
          client = await this.clientsService.create(newClientData, actor);
          this.logger.log(`Cliente ${client.full_name} creado para la empresa ${actor.empresaId}.`);
        }

        // 5. Creamos la compra, PASANDO EL ACTOR para la auditoría y la asignación de empresa
        await this.purchasesService.createPurchase({
          client_document_id: client.document_id,
          amount: Number(Valor),
        }, actor);
        
        results.processed++;
      } catch (error: any) {
        this.logger.error(`Error al procesar fila: ${JSON.stringify(row)}`, error.stack);
        results.failed++;
        results.errors.push(`Fila ${JSON.stringify(row)}: ${error.message}`);
      }
    }
    
    this.logger.log(`Archivo de contingencia para empresa ${actor.empresaId} procesado: ${results.processed} exitosos, ${results.failed} fallidos.`);
    return results;
  }
}