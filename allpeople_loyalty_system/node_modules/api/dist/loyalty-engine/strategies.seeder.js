"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategiesSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const loyalty_strategy_entity_1 = require("./loyalty-strategy.entity");
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
            notification_days_before: 7,
            discount_percentage: 15,
            message_template: '¡Feliz cumpleaños [NOMBRE]! 🎂 Queremos celebrarlo contigo. Pasa por All People esta semana y recibe un 15% de descuento en tu compra. ¡Te esperamos!'
        },
    },
];
let StrategiesSeeder = class StrategiesSeeder {
    strategyRepository;
    constructor(strategyRepository) {
        this.strategyRepository = strategyRepository;
    }
    async onModuleInit() {
        for (const strategy of STRATEGIES) {
            const strategyExists = await this.strategyRepository.findOneBy({ key: strategy.key });
            if (!strategyExists) {
                console.log(`Creating strategy: ${strategy.name}`);
                const newStrategy = this.strategyRepository.create({
                    key: strategy.key,
                    name: strategy.name,
                    is_active: strategy.key === 'points',
                });
                await this.strategyRepository.save(newStrategy);
            }
        }
    }
};
exports.StrategiesSeeder = StrategiesSeeder;
exports.StrategiesSeeder = StrategiesSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StrategiesSeeder);
//# sourceMappingURL=strategies.seeder.js.map