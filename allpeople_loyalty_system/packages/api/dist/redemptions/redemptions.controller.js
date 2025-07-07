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
exports.RedemptionsController = void 0;
const common_1 = require("@nestjs/common");
const redemptions_service_1 = require("./redemptions.service");
const create_redemption_dto_1 = require("./dto/create-redemption.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/user.entity");
const roles_guard_1 = require("../auth/guards/roles.guard");
let RedemptionsController = class RedemptionsController {
    redemptionsService;
    constructor(redemptionsService) {
        this.redemptionsService = redemptionsService;
    }
    redeem(createRedemptionDto, req) {
        const actor = req.user;
        return this.redemptionsService.redeem(createRedemptionDto, actor);
    }
};
exports.RedemptionsController = RedemptionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.CASHIER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_redemption_dto_1.CreateRedemptionDto, Object]),
    __metadata("design:returntype", void 0)
], RedemptionsController.prototype, "redeem", null);
exports.RedemptionsController = RedemptionsController = __decorate([
    (0, common_1.Controller)('redemptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [redemptions_service_1.RedemptionsService])
], RedemptionsController);
//# sourceMappingURL=redemptions.controller.js.map