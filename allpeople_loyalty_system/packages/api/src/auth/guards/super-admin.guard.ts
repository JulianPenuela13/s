// packages/api/src/auth/guards/super-admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../users/user.entity';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    // --- LÍNEAS DE DIAGNÓSTICO ---
    console.log('--- SuperAdminGuard ---');
    console.log('Contenido de req.user:', user);
    console.log('Valor de user.rol:', user?.rol);
    console.log('¿Es igual a "super_admin"?', user?.rol === UserRole.SUPER_ADMIN);
    console.log('-----------------------');
    // --- FIN DE DIAGNÓSTICO ---

    if (user && user.rol === UserRole.SUPER_ADMIN) {
      return true;
    }

    throw new ForbiddenException('Acceso denegado. Se requiere permiso de Super Administrador.');
  }
}