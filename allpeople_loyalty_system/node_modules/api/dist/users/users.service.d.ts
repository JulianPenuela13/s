import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findOneByEmail(email: string): Promise<User | null>;
    create(createUserDto: CreateUserDto, empresaId: number): Promise<Omit<User, 'password_hash' | 'hashPassword'>>;
    findAll(empresaId: number): Promise<Omit<User, 'password_hash' | 'hashPassword'>[]>;
    findOne(id: string, empresaId: number): Promise<Omit<User, 'password_hash' | 'hashPassword'>>;
    remove(id: string, empresaId: number): Promise<void>;
}
