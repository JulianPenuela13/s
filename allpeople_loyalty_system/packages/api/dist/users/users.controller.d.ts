import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, req: any): Promise<{
        id: string;
        email: string;
        role: UserRole;
        full_name: string;
        empresa: import("../empresas/entities/empresa.entity").Empresa;
        empresa_id: number;
        created_at: Date;
    }>;
    findAll(req: any): Promise<import("./user.entity").User[]>;
    findOne(id: string, req: any): Promise<import("./user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<{
        id: string;
        email: string;
        role: UserRole;
        full_name: string;
        empresa: import("../empresas/entities/empresa.entity").Empresa;
        empresa_id: number;
        created_at: Date;
    }>;
    remove(id: string, req: any): Promise<void>;
}
