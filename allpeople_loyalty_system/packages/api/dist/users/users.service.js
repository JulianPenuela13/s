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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const audit_service_1 = require("../audit/audit.service");
let UsersService = UsersService_1 = class UsersService {
    usersRepository;
    auditService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(usersRepository, auditService) {
        this.usersRepository = usersRepository;
        this.auditService = auditService;
    }
    async create(createUserDto, actor) {
        const { email, password, empresa_id, ...restOfDto } = createUserDto;
        const targetEmpresaId = empresa_id || actor.empresaId;
        const existingUser = await this.findOneByEmail(email, targetEmpresaId);
        if (existingUser) {
            throw new common_1.ConflictException(`El email '${email}' ya está en uso en esa empresa.`);
        }
        const user = this.usersRepository.create({
            ...restOfDto,
            email: email,
            password_hash: password,
            empresa_id: targetEmpresaId,
        });
        const savedUser = await this.usersRepository.save(user);
        await this.auditService.logAction(actor, 'USER_CREATE', { createdUserId: savedUser.id, email: savedUser.email });
        const { password_hash: _, ...result } = savedUser;
        return result;
    }
    findAll(actor) {
        return this.usersRepository.find({
            select: ['id', 'email', 'full_name', 'role', 'created_at', 'empresa_id'],
            where: { empresa_id: actor.empresaId },
            order: { full_name: 'ASC' },
        });
    }
    async findOne(id, actor) {
        const user = await this.usersRepository.findOne({
            where: { id: id, empresa_id: actor.empresaId },
            select: ['id', 'email', 'full_name', 'role', 'created_at', 'empresa_id'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado en su empresa.`);
        }
        return user;
    }
    findOneByEmail(email, empresaId) {
        return this.usersRepository.findOneBy({ email: email, empresa_id: empresaId });
    }
    findForAuth(email) {
        return this.usersRepository.find({ where: { email } });
    }
    async update(id, updateUserDto, actor) {
        await this.findOne(id, actor);
        const { password, ...restOfDto } = updateUserDto;
        const payload = restOfDto;
        if (password) {
            payload.password_hash = password;
        }
        if (Object.keys(payload).length > 0) {
            await this.usersRepository.update(id, payload);
        }
        await this.auditService.logAction(actor, 'USER_UPDATE', {
            updatedUserId: id,
            changes: updateUserDto
        });
        const updatedUserEntity = await this.usersRepository.findOneBy({ id });
        if (!updatedUserEntity) {
            throw new common_1.NotFoundException(`El usuario con ID ${id} desapareció después de la actualización.`);
        }
        const { password_hash, ...result } = updatedUserEntity;
        return result;
    }
    async remove(id, actor) {
        const userToDelete = await this.findOne(id, actor);
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado.`);
        }
        await this.auditService.logAction(actor, 'USER_DELETE', { deletedUserId: id, email: userToDelete.email });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map