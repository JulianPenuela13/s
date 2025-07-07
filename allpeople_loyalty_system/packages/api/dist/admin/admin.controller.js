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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const super_admin_guard_1 = require("../auth/guards/super-admin.guard");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    findAllEmpresas() {
        return this.adminService.findAllEmpresas();
    }
    crearNuevaEmpresa(body) {
        return this.adminService.crearEmpresa(body.nombre_empresa, body.plan_suscripcion);
    }
    crearAdminParaEmpresa(id, body, req) {
        return this.adminService.crearAdminParaEmpresa(id, body, req.user);
    }
    suspenderEmpresa(id) {
        return this.adminService.actualizarEstadoSuscripcion(id, 'suspendida');
    }
    reactivarEmpresa(id) {
        return this.adminService.actualizarEstadoSuscripcion(id, 'activa');
    }
    eliminarEmpresa(id) {
        return this.adminService.eliminarEmpresa(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('empresas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "findAllEmpresas", null);
__decorate([
    (0, common_1.Post)('empresas'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "crearNuevaEmpresa", null);
__decorate([
    (0, common_1.Post)('empresas/:id/crear-admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "crearAdminParaEmpresa", null);
__decorate([
    (0, common_1.Patch)('empresas/:id/suspender'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "suspenderEmpresa", null);
__decorate([
    (0, common_1.Patch)('empresas/:id/reactivar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "reactivarEmpresa", null);
__decorate([
    (0, common_1.Delete)('empresas/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "eliminarEmpresa", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('super-admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map