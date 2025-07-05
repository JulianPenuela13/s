import { UserRole } from '../user.entity';
export declare class CreateUserDto {
    email: string;
    full_name: string;
    role: UserRole;
    password: string;
}
