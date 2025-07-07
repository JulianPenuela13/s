// packages/api/src/users/users.service.ts
import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { Actor } from '../audit/actor.interface';

type SafeUser = Omit<User, 'password_hash' | 'hashPassword'>;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async create(createUserDto: CreateUserDto & { empresa_id?: number }, actor: Actor): Promise<SafeUser> {
    const { email, password, empresa_id, ...restOfDto } = createUserDto;
    
    // --- LA CORRECCIÓN DEFINITIVA ESTÁ AQUÍ ---
    // Si se pasa una 'empresa_id' al crear (como lo hace el Super-Admin para un nuevo admin), se usa esa.
    // Si no, se usa la 'empresaId' del actor que crea el usuario (como un Admin creando un Cajero).
    const targetEmpresaId = empresa_id || actor.empresaId;
    
    // Buscamos si el email ya existe DENTRO DE LA EMPRESA CORRECTA.
    const existingUser = await this.findOneByEmail(email, targetEmpresaId);
    if (existingUser) {
      throw new ConflictException(`El email '${email}' ya está en uso en esa empresa.`);
    }

    const user = this.usersRepository.create({
      ...restOfDto,
      email: email,
      password_hash: password,
      empresa_id: targetEmpresaId, // <-- Se asigna la empresa correcta y definitiva
    });
    const savedUser = await this.usersRepository.save(user);

    // El log de auditoría usa el actor que realizó la acción, lo cual es correcto.
    await this.auditService.logAction(actor, 'USER_CREATE', { createdUserId: savedUser.id, email: savedUser.email });

    const { password_hash: _, ...result } = savedUser;
    return result;
  }

  findAll(actor: Actor): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'full_name', 'role', 'created_at', 'empresa_id'],
      where: { empresa_id: actor.empresaId },
      order: { full_name: 'ASC' },
    });
  }

  async findOne(id: string, actor: Actor): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id, empresa_id: actor.empresaId },
      select: ['id', 'email', 'full_name', 'role', 'created_at', 'empresa_id'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado en su empresa.`);
    }
    return user;
  }
  
  findOneByEmail(email: string, empresaId: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ email: email, empresa_id: empresaId });
  }

  findForAuth(email: string): Promise<User[]> {
    return this.usersRepository.find({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto, actor: Actor): Promise<SafeUser> {
    await this.findOne(id, actor);
    
    const { password, ...restOfDto } = updateUserDto;
    const payload: Partial<User> = restOfDto;

    if (password) {
      payload.password_hash = password;
    }

    if (Object.keys(payload).length > 0) {
      await this.usersRepository.update(id, payload);
    }
    
    await this.auditService.logAction(actor, 'USER_UPDATE', { 
      updatedUserId: id,
      changes: updateUserDto 
    });

    const updatedUserEntity = await this.usersRepository.findOneBy({ id });
    if (!updatedUserEntity) {
      throw new NotFoundException(`El usuario con ID ${id} desapareció después de la actualización.`);
    }
    
    const { password_hash, ...result } = updatedUserEntity;
    return result;
  }

  async remove(id: string, actor: Actor): Promise<void> {
    const userToDelete = await this.findOne(id, actor);
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    await this.auditService.logAction(actor, 'USER_DELETE', { deletedUserId: id, email: userToDelete.email });
  }
}