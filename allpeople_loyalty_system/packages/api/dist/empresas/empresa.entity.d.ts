import { User } from '../users/user.entity';
export declare class Empresa {
    id: number;
    nombre_empresa: string;
    plan_suscripcion: string;
    fecha_creacion: Date;
    users: User[];
}
