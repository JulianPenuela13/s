import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    findAllEmpresas(): Promise<import("../empresas/entities/empresa.entity").Empresa[]>;
    crearNuevaEmpresa(body: {
        nombre_empresa: string;
        plan_suscripcion: string;
        twilio_phone_number?: string;
        wpp_session_name?: string;
        whatsapp_provider?: string;
    }): Promise<import("../empresas/entities/empresa.entity").Empresa>;
    crearAdminParaEmpresa(id: number, body: any, req: any): Promise<{
        id: string;
        email: string;
        role: import("../users/user.entity").UserRole;
        full_name: string;
        empresa: import("../empresas/entities/empresa.entity").Empresa;
        empresa_id: number;
        created_at: Date;
    }>;
    suspenderEmpresa(id: number): Promise<{
        message: string;
    }>;
    reactivarEmpresa(id: number): Promise<{
        message: string;
    }>;
    eliminarEmpresa(id: number): Promise<{
        message: string;
    }>;
}
