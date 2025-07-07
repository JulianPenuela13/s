// packages/api/src/auth/auth.service.ts

import { Injectable, Logger } from '@nestjs/common'; // <-- Importa Logger
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Añadimos un logger para ver los mensajes en la consola del backend
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // 1. Buscamos TODOS los usuarios con ese email. Podrían ser de diferentes empresas.
    const potentialUsers = await this.usersService.findForAuth(email);
    if (!potentialUsers || potentialUsers.length === 0) {
      return null;
    }

    // 2. Probamos la contraseña contra cada uno de ellos.
    for (const user of potentialUsers) {
      const isMatch = await bcrypt.compare(pass, user.password_hash);
      if (isMatch) {
        // 3. Si encontramos una coincidencia, devolvemos ESE usuario específico.
        const { password_hash, ...result } = user;
        return result;
      }
    }

    // Si después de probar todos, ninguno coincide, entonces las credenciales son incorrectas.
    return null;
  }

  async login(user: any) {
    const payload = {
      userId: user.id,
      rol: user.role.toLowerCase(),
      empresaId: user.empresa_id 
    };

    const accessToken = this.jwtService.sign(payload);

    // --- LÍNEAS DE DIAGNÓSTICO ---
    this.logger.log('--- Generando Token JWT ---');
    this.logger.log(`Usuario: ${user.email}, Rol del objeto User: ${user.role}`);
    this.logger.log('Payload del Token:', payload);
    this.logger.log(`Token generado: ${accessToken}`);
    this.logger.log('---------------------------');
    // --- FIN DE DIAGNÓSTICO ---

    return {
      access_token: accessToken,
    };
  }
}