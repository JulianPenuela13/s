import { Repository } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { UsersService } from '../users/users.service';
import { Actor } from '../audit/actor.interface';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { UserRole } from '../users/user.entity';
export declare class AdminService {
    private empresaRepository;
    private strategyRepository;
    private usersService;
    constructor(empresaRepository: Repository<Empresa>, strategyRepository: Repository<LoyaltyStrategy>, usersService: UsersService);
    crearEmpresa(nombre: string, plan: string): Promise<Empresa>;
    crearAdminParaEmpresa(empresaId: number, datosAdminDto: any, actor: Actor): Promise<{
        id: string;
        email: string;
        role: UserRole;
        full_name: string;
        empresa: Empresa;
        empresa_id: number;
        created_at: Date;
    }>;
    findAllEmpresas(): Promise<Empresa[]>;
    actualizarEstadoSuscripcion(id: number, nuevoEstado: 'activa' | 'suspendida'): Promise<{
        message: string;
    }>;
    eliminarEmpresa(id: number): Promise<{
        message: string;
    }>;
}
