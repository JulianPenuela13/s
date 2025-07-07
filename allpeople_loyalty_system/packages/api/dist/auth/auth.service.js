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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        const potentialUsers = await this.usersService.findForAuth(email);
        if (!potentialUsers || potentialUsers.length === 0) {
            return null;
        }
        for (const user of potentialUsers) {
            const isMatch = await bcrypt.compare(pass, user.password_hash);
            if (isMatch) {
                const { password_hash, ...result } = user;
                return result;
            }
        }
        return null;
    }
    async login(user) {
        const payload = {
            userId: user.id,
            rol: user.role.toLowerCase(),
            empresaId: user.empresa_id
        };
        const accessToken = this.jwtService.sign(payload);
        this.logger.log('--- Generando Token JWT ---');
        this.logger.log(`Usuario: ${user.email}, Rol del objeto User: ${user.role}`);
        this.logger.log('Payload del Token:', payload);
        this.logger.log(`Token generado: ${accessToken}`);
        this.logger.log('---------------------------');
        return {
            access_token: accessToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map