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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findOneByEmail(email) {
        return this.usersRepository.findOne({ where: { email }, relations: ['empresa'] });
    }
    async create(createUserDto, empresaId) {
        const newUser = this.usersRepository.create({
            ...createUserDto,
            empresa_id: empresaId,
        });
        const savedUser = await this.usersRepository.save(newUser);
        const { password_hash, ...result } = savedUser;
        return result;
    }
    async findAll(empresaId) {
        return this.usersRepository.find({
            where: { empresa_id: empresaId },
            select: ['id', 'email', 'full_name', 'role', 'created_at', 'empresa_id'],
        });
    }
    async findOne(id, empresaId) {
        const user = await this.usersRepository.findOne({
            where: { id, empresa_id: empresaId },
            select: ['id', 'email', 'full_name', 'role', 'created_at', 'empresa_id'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado.`);
        }
        return user;
    }
    async remove(id, empresaId) {
        const result = await this.usersRepository.delete({ id, empresa_id: empresaId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado.`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map