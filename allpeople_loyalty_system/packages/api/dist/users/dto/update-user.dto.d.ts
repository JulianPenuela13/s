import { UserRole } from '../user.entity';
export declare class UpdateUserDto {
    email?: string;
    full_name?: string;
    role?: UserRole;
    password?: string;
}
