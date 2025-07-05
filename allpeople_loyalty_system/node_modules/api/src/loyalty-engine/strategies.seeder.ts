// packages/api/src/loyalty-engine/strategies.seeder.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyStrategy } from './loyalty-strategy.entity'; // Crearemos esta entidad ahora

const STRATEGIES = [
  { key: 'points', name: 'Puntos Tradicionales' },
  { key: 'frequency', name: 'Frecuencia de Compras' },
  { key: 'campaigns', name: 'Campañas de Puntos Múltiples' },
  { key: 'cashback', name: 'Cashback' },
  { key: 'secret_rewards', name: 'Recompensas Secretas' },
  { key: 'random_prizes', name: 'Premios Aleatorios' },
  {
    key: 'birthday',
    name: 'Campaña de Cumpleaños',
    description: 'Envía un saludo y un beneficio especial a los clientes en la semana de su cumpleaños.',
    is_active: false,
    settings: {
      notification_days_before: 7, // Por defecto, notificar 7 días antes
      discount_percentage: 15, // Por defecto, un 15% de descuento
      message_template: '¡Feliz cumpleaños [NOMBRE]! 🎂 Queremos celebrarlo contigo. Pasa por All People esta semana y recibe un 15% de descuento en tu compra. ¡Te esperamos!'
    },
  },
];

@Injectable()
export class StrategiesSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(LoyaltyStrategy)
    private strategyRepository: Repository<LoyaltyStrategy>,
  ) {}

  async onModuleInit() {
    for (const strategy of STRATEGIES) {
      const strategyExists = await this.strategyRepository.findOneBy({ key: strategy.key });
      if (!strategyExists) {
        console.log(`Creating strategy: ${strategy.name}`);
        const newStrategy = this.strategyRepository.create({
          key: strategy.key,
          name: strategy.name,
          is_active: strategy.key === 'points', // Dejamos 'puntos' activa por defecto
        });
        await this.strategyRepository.save(newStrategy);
      }
    }
  }
}