import { Injectable, OnModuleInit, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { Actor } from '../audit/audit.service'

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    await this.seedInitialUsers();
  }

  private async seedInitialUsers() {
    const adminExists = await this.usersRepository.findOneBy({ role: UserRole.ADMIN });
    if (!adminExists) {
      this.logger.log('Admin user not found, creating one...');
      const adminUser = this.usersRepository.create({ email: 'admin@allpeople.com', password_hash: 'strongpassword', full_name: 'Admin General', role: UserRole.ADMIN });
      await this.usersRepository.save(adminUser);
      this.logger.log('Admin user created successfully.');
    }
    const cashierExists = await this.usersRepository.findOneBy({ role: UserRole.CASHIER });
    if (!cashierExists) {
        this.logger.log('Cashier user not found, creating one...');
        const cashierUser = this.usersRepository.create({ email: 'cajero@allpeople.com', password_hash: 'password123', full_name: 'Cajero de Tienda', role: UserRole.CASHIER });
        await this.usersRepository.save(cashierUser);
        this.logger.log('Cashier user created successfully.');
    }
  }
  
  async create(createUserDto: CreateUserDto, actor: Actor): Promise<Omit<User, 'password_hash' | 'hashPassword'>> {
    const { email, password, ...restOfDto } = createUserDto;

    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException(`El email '${email}' ya está en uso.`);
    }

    const user = this.usersRepository.create({
      ...restOfDto,
      email: email,
      password_hash: password, 
    });
    const savedUser = await this.usersRepository.save(user);

    await this.auditService.logAction(actor, 'USER_CREATE', { createdUserId: savedUser.id, email: savedUser.email });

    const { password_hash, ...result } = savedUser;
    return result;
  }


  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'full_name', 'role', 'created_at'],
      order: { full_name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id }, select: ['id', 'email', 'full_name', 'role', 'created_at'] });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return user;
  }
  
  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto, actor: Actor): Promise<User> {
    const userToUpdate = await this.findOne(id);
    const { password, ...restOfDto } = updateUserDto;
    const payload: Partial<User> = restOfDto;
    if (password) {
      payload.password_hash = password;
    }
    if (Object.keys(payload).length === 0) {
      return this.findOne(id);
    }
    await this.findOne(id);
    await this.usersRepository.update(id, payload);
    await this.auditService.logAction(actor, 'USER_UPDATE', { 
        updatedUserEmail: userToUpdate.email, // Usamos el email del usuario que encontramos
        changes: updateUserDto 
    });
    return this.findOne(id);
  }

  async remove(id: string, actor: Actor): Promise<void> {
    const userToDelete = await this.findOne(id);
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    await this.auditService.logAction(actor, 'USER_DELETE', { deletedUserId: id, email: userToDelete.email });
  }
}