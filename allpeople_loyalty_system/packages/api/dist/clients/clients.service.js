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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_entity_1 = require("./client.entity");
let ClientsService = class ClientsService {
    clientsRepository;
    constructor(clientsRepository) {
        this.clientsRepository = clientsRepository;
    }
    async findOneByPhoneAcrossTenants(phoneNumber) {
        return this.clientsRepository.findOne({ where: { phone_number: phoneNumber } });
    }
    async create(createClientDto, empresaId) {
        const newClient = this.clientsRepository.create({
            ...createClientDto,
            empresa: { id: empresaId },
        });
        return this.clientsRepository.save(newClient);
    }
    async findAll(empresaId) {
        return this.clientsRepository.find({
            where: { empresa_id: empresaId },
        });
    }
    async findOne(id, empresaId) {
        const client = await this.clientsRepository.findOne({
            where: { id, empresa_id: empresaId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Cliente con ID "${id}" no encontrado.`);
        }
        return client;
    }
    async update(id, updateClientDto, empresaId) {
        const client = await this.findOne(id, empresaId);
        const updatedClient = this.clientsRepository.merge(client, updateClientDto);
        return this.clientsRepository.save(updatedClient);
    }
    async remove(id, empresaId) {
        const result = await this.clientsRepository.delete({ id, empresa_id: empresaId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Cliente con ID "${id}" no encontrado.`);
        }
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientsService);
//# sourceMappingURL=clients.service.js.map