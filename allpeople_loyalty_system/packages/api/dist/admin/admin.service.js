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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const empresa_entity_1 = require("../empresas/entities/empresa.entity");
const users_service_1 = require("../users/users.service");
const loyalty_strategy_entity_1 = require("../loyalty-engine/loyalty-strategy.entity");
const user_entity_1 = require("../users/user.entity");
const DEFAULT_STRATEGIES = [
    { key: 'points', name: 'Puntos Tradicionales', is_active: true },
    { key: 'frequency', name: 'Frecuencia de Compras', is_active: false },
    { key: 'campaigns', name: 'Campañas de Puntos Múltiples', is_active: false },
    { key: 'cashback', name: 'Cashback', is_active: false },
    { key: 'secret_rewards', name: 'Recompensas Secretas', is_active: false },
    { key: 'random_prizes', name: 'Premios Aleatorios', is_active: false },
    { key: 'birthday', name: 'Campaña de Cumpleaños', is_active: false, settings: {
            notification_days_before: 7,
            message_template: '¡Feliz cumpleaños [NOMBRE]! 🎂 Queremos celebrarlo contigo. Pasa por nuestra tienda y recibe una sorpresa especial. ¡Te esperamos!'
        } },
];
let AdminService = class AdminService {
    empresaRepository;
    strategyRepository;
    usersService;
    constructor(empresaRepository, strategyRepository, usersService) {
        this.empresaRepository = empresaRepository;
        this.strategyRepository = strategyRepository;
        this.usersService = usersService;
    }
    async crearEmpresa(nombre, plan) {
        const nuevaEmpresa = this.empresaRepository.create({
            nombre_empresa: nombre,
            plan_suscripcion: plan,
        });
        const savedEmpresa = await this.empresaRepository.save(nuevaEmpresa);
        for (const strategyData of DEFAULT_STRATEGIES) {
            const newStrategy = this.strategyRepository.create({
                ...strategyData,
                empresa_id: savedEmpresa.id,
            });
            await this.strategyRepository.save(newStrategy);
        }
        return savedEmpresa;
    }
    async crearAdminParaEmpresa(empresaId, datosAdminDto, actor) {
        const empresa = await this.empresaRepository.findOneBy({ id: empresaId });
        if (!empresa) {
            throw new common_1.NotFoundException(`La empresa con ID ${empresaId} no fue encontrada.`);
        }
        const adminUserData = {
            full_name: datosAdminDto.full_name,
            email: datosAdminDto.email,
            password: datosAdminDto.password,
            role: user_entity_1.UserRole.ADMIN,
        };
        return this.usersService.create(adminUserData, actor);
    }
    async findAllEmpresas() {
        return this.empresaRepository.find({ order: { nombre_empresa: 'ASC' } });
    }
    async actualizarEstadoSuscripcion(id, nuevoEstado) {
        const result = await this.empresaRepository.update(id, { estado_suscripcion: nuevoEstado });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Empresa con ID ${id} no encontrada.`);
        }
        return { message: `Empresa ${id} actualizada al estado '${nuevoEstado}'.` };
    }
    async eliminarEmpresa(id) {
        const result = await this.empresaRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Empresa con ID ${id} no encontrada.`);
        }
        return { message: `Empresa con ID ${id} y todos sus datos han sido eliminados.` };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(empresa_entity_1.Empresa)),
    __param(1, (0, typeorm_1.InjectRepository)(loyalty_strategy_entity_1.LoyaltyStrategy)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], AdminService);
//# sourceMappingURL=admin.service.js.map