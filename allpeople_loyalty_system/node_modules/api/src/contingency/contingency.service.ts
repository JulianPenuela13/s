// packages/api/src/contingency/contingency.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as Papa from 'papaparse';
import { ClientsService } from '../clients/clients.service';
import { PurchasesService } from '../purchases/purchases.service';
import { CreateClientDto } from '../clients/dto/create-client.dto';

@Injectable()
export class ContingencyService {
  private readonly logger = new Logger(ContingencyService.name);

  constructor(
    private readonly clientsService: ClientsService,
    private readonly purchasesService: PurchasesService,
  ) {}

  async processContingencyFile(fileBuffer: Buffer) {
    const fileContent = fileBuffer.toString('utf-8');
    const results = { processed: 0, failed: 0, errors: [] as string[] };

    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    for (const row of parsed.data) {
      try {
        // Nos aseguramos de que la fila sea un objeto antes de procesarla
        if (typeof row !== 'object' || row === null) {
          continue;
        }

        // Si la fila está completamente vacía o solo contiene espacios, la ignoramos silenciosamente
        if (Object.values(row).every(value => value === null || String(value).trim() === '')) {
          continue;
        }

        const { Cedula, Valor, NombreCompleto, Telefono, FechaNacimiento } = row as any;
        
        if (!Cedula || !Valor) {
          throw new BadRequestException(`Fila inválida, faltan datos de Cedula o Valor: ${JSON.stringify(row)}`);
        }

        let client = await this.clientsService.findOneByDocument(Cedula);

        if (!client) {
          this.logger.log(`Client with document ${Cedula} not found. Attempting to create...`);
          if (!NombreCompleto || !Telefono) {
            throw new BadRequestException(`Cliente nuevo con cédula ${Cedula} no tiene NombreCompleto y Telefono en el archivo.`);
          }
          
          // Limpiamos CUALQUIER símbolo del teléfono para estandarizarlo
          const cleanTelefono = String(Telefono).replace(/\D/g, '');

          const newClientData: CreateClientDto = {
            document_id: Cedula,
            full_name: NombreCompleto,
            phone_number: cleanTelefono,
          };

          if (FechaNacimiento) {
            const parts = String(FechaNacimiento).split('/');
            if (parts.length === 3) {
              const [day, month, year] = parts;
              // Re-armamos la fecha en el formato YYYY-MM-DD
              newClientData.birth_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          }

          client = await this.clientsService.create(newClientData);
          this.logger.log(`Client ${client.full_name} created successfully.`);
        }

        await this.purchasesService.createPurchase({
          client_document_id: client.document_id,
          amount: Number(Valor),
        });
        
        results.processed++;
      } catch (error: any) {
        this.logger.error(`Failed to process row: ${JSON.stringify(row)}`, error.message);
        results.failed++;
        results.errors.push(`Fila ${JSON.stringify(row)}: ${error.message}`);
      }
    }
    
    this.logger.log(`Contingency file processed: ${results.processed} successful, ${results.failed} failed.`);
    return results;
  }
}