import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { Actor } from '../audit/actor.interface';
type SafeUser = Omit<User, 'password_hash' | 'hashPassword'>;
export declare class UsersService {
    private usersRepository;
    private auditService;
    private readonly logger;
    constructor(usersRepository: Repository<User>, auditService: AuditService);
    create(createUserDto: CreateUserDto & {
        empresa_id?: number;
    }, actor: Actor): Promise<SafeUser>;
    findAll(actor: Actor): Promise<User[]>;
    findOne(id: string, actor: Actor): Promise<User>;
    findOneByEmail(email: string, empresaId: number): Promise<User | null>;
    findForAuth(email: string): Promise<User[]>;
    update(id: string, updateUserDto: UpdateUserDto, actor: Actor): Promise<SafeUser>;
    remove(id: string, actor: Actor): Promise<void>;
}
export {};
