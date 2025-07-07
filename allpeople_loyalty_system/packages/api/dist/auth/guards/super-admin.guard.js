"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../users/user.entity");
let SuperAdminGuard = class SuperAdminGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        console.log('--- SuperAdminGuard ---');
        console.log('Contenido de req.user:', user);
        console.log('Valor de user.rol:', user?.rol);
        console.log('¿Es igual a "super_admin"?', user?.rol === user_entity_1.UserRole.SUPER_ADMIN);
        console.log('-----------------------');
        if (user && user.rol === user_entity_1.UserRole.SUPER_ADMIN) {
            return true;
        }
        throw new common_1.ForbiddenException('Acceso denegado. Se requiere permiso de Super Administrador.');
    }
};
exports.SuperAdminGuard = SuperAdminGuard;
exports.SuperAdminGuard = SuperAdminGuard = __decorate([
    (0, common_1.Injectable)()
], SuperAdminGuard);
//# sourceMappingURL=super-admin.guard.js.map