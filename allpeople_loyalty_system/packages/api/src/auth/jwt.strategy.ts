// packages/api/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // 1. Obtenemos la clave secreta PRIMERO.
    const secret = configService.get<string>('JWT_SECRET');

    // 2. Verificamos que la clave exista. Si no, la aplicación no debe iniciar.
    // Esto es una medida de seguridad crucial.
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno. La aplicación no puede iniciarse de forma segura.');
    }

    // 3. Ahora que TypeScript sabe que 'secret' es un string, llamamos a super()
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Pasamos la variable que ya hemos verificado.
    });
  }

  async validate(payload: any) {
    // Esta parte ya estaba correcta.
    return {
      userId: payload.userId,
      rol: payload.rol,
      empresaId: payload.empresaId,
    };
  }
}