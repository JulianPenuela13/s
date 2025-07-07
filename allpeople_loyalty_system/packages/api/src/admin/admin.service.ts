// packages/api/src/admin/admin.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { UsersService } from '../users/users.service';
import { Actor } from '../audit/actor.interface';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';
import { UserRole } from '../users/user.entity'; // <-- 1. IMPORTAMOS EL ENUM UserRole

const DEFAULT_STRATEGIES = [
    { key: 'points', name: 'Puntos Tradicionales', is_active: true },
    { key: 'frequency', name: 'Frecuencia de Compras', is_active: false },
    { key: 'campaigns', name: 'Campañas de Puntos Múltiples', is_active: false },
    { key: 'cashback', name: 'Cashback', is_active: false },
    { key: 'secret_rewards', name: 'Recompensas Secretas', is_active: false },
    { key: 'random_prizes', name: 'Premios Aleatorios', is_active: false },
    { key: 'birthday', name: 'Campaña de Cumpleaños', is_active: false, settings: {
        notification_days_before: 7,
        message_template: '¡Feliz cumpleaños [NOMBRE]! 🎂 Queremos celebrarlo contigo. Pasa por nuestra tienda y recibe una sorpresa especial. ¡Te esperamos!'
    }},
];

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(LoyaltyStrategy)
    private strategyRepository: Repository<LoyaltyStrategy>,
    private usersService: UsersService,
  ) {}

  async crearEmpresa(nombre: string, plan: string): Promise<Empresa> {
    const nuevaEmpresa = this.empresaRepository.create({
      nombre_empresa: nombre,
      plan_suscripcion: plan,
    });
    const savedEmpresa = await this.empresaRepository.save(nuevaEmpresa);

    for (const strategyData of DEFAULT_STRATEGIES) {
        const newStrategy = this.strategyRepository.create({
            ...strategyData,
            empresa_id: savedEmpresa.id,
        });
        await this.strategyRepository.save(newStrategy);
    }
    
    return savedEmpresa;
  }

  async crearAdminParaEmpresa(empresaId: number, datosAdminDto: any, actor: Actor) {
    const empresa = await this.empresaRepository.findOneBy({ id: empresaId });
    if (!empresa) {
      throw new NotFoundException(`La empresa con ID ${empresaId} no fue encontrada.`);
    }

    const adminUserData = {
      full_name: datosAdminDto.full_name,
      email: datosAdminDto.email,
      password: datosAdminDto.password,
      // --- LA CORRECCIÓN DEFINITIVA ESTÁ AQUÍ ---
      // Usamos el valor del enum en lugar de un string simple.
      role: UserRole.ADMIN,
    };

    return this.usersService.create(adminUserData, actor);
  }

  async findAllEmpresas(): Promise<Empresa[]> {
    return this.empresaRepository.find({ order: { nombre_empresa: 'ASC' } });
  }

  async actualizarEstadoSuscripcion(id: number, nuevoEstado: 'activa' | 'suspendida') {
    const result = await this.empresaRepository.update(id, { estado_suscripcion: nuevoEstado });
    if (result.affected === 0) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada.`);
    }
    return { message: `Empresa ${id} actualizada al estado '${nuevoEstado}'.` };
  }

  async eliminarEmpresa(id: number): Promise<{ message: string }> {
    const result = await this.empresaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada.`);
    }
    return { message: `Empresa con ID ${id} y todos sus datos han sido eliminados.` };
  }
}