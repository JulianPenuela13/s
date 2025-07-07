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
exports.StrategiesController = void 0;
const common_1 = require("@nestjs/common");
const strategies_service_1 = require("./strategies.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/user.entity");
const update_strategy_settings_dto_1 = require("./dto/update-strategy-settings.dto");
let StrategiesController = class StrategiesController {
    strategiesService;
    constructor(strategiesService) {
        this.strategiesService = strategiesService;
    }
    getStrategies(req) {
        const actor = req.user;
        return this.strategiesService.getStrategies(actor);
    }
    toggleStrategy(id, isActive, req) {
        const actor = req.user;
        return this.strategiesService.toggleStrategy(id, isActive, actor);
    }
    updateStrategySettings(id, updateDto, req) {
        const actor = req.user;
        return this.strategiesService.updateStrategySettings(id, updateDto, actor);
    }
    getAuditLogs(req) {
        const actor = req.user;
        return this.strategiesService.getAuditLogs(actor);
    }
};
exports.StrategiesController = StrategiesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StrategiesController.prototype, "getStrategies", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('is_active')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", void 0)
], StrategiesController.prototype, "toggleStrategy", null);
__decorate([
    (0, common_1.Patch)(':id/settings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_strategy_settings_dto_1.UpdateStrategySettingsDto, Object]),
    __metadata("design:returntype", void 0)
], StrategiesController.prototype, "updateStrategySettings", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StrategiesController.prototype, "getAuditLogs", null);
exports.StrategiesController = StrategiesController = __decorate([
    (0, common_1.Controller)('admin/strategies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [strategies_service_1.StrategiesService])
], StrategiesController);
//# sourceMappingURL=strategies.controller.js.map