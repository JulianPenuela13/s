"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const typeorm_config_1 = require("./config/typeorm.config");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const clients_module_1 = require("./clients/clients.module");
const purchases_module_1 = require("./purchases/purchases.module");
const loyalty_engine_module_1 = require("./loyalty-engine/loyalty-engine.module");
const rewards_module_1 = require("./rewards/rewards.module");
const redemptions_module_1 = require("./redemptions/redemptions.module");
const reports_module_1 = require("./reports/reports.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const audit_module_1 = require("./audit/audit.module");
const tasks_module_1 = require("./tasks/tasks.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const contingency_module_1 = require("./contingency/contingency.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync(typeorm_config_1.typeOrmAsyncConfig),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            clients_module_1.ClientsModule,
            purchases_module_1.PurchasesModule,
            loyalty_engine_module_1.LoyaltyEngineModule,
            rewards_module_1.RewardsModule,
            redemptions_module_1.RedemptionsModule,
            reports_module_1.ReportsModule,
            whatsapp_module_1.WhatsappModule,
            audit_module_1.AuditModule,
            tasks_module_1.TasksModule,
            campaigns_module_1.CampaignsModule,
            contingency_module_1.ContingencyModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map