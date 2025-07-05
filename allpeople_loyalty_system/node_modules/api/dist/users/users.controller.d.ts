import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, req: any): Promise<Omit<import("./user.entity").User, "password_hash" | "hashPassword">>;
    findAll(req: any): Promise<Omit<import("./user.entity").User, "password_hash" | "hashPassword">[]>;
    findOne(id: string, req: any): Promise<Omit<import("./user.entity").User, "password_hash" | "hashPassword">>;
    remove(id: string, req: any): Promise<void>;
}
