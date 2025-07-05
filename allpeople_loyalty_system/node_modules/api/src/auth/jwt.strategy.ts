// packages/api/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SUPER_SECRET_KEY_CHANGE_IN_PROD', // Debe ser la misma que en el módulo
    });
  }

  async validate(payload: any) {
    // El payload decodificado del JWT estará disponible en request.user
    return { userId: payload.sub, email: payload.email, role: payload.role, empresaId: payload.empresaId };
  }
}