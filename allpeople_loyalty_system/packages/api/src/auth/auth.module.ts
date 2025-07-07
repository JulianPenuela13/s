// packages/api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- 1. Import Config classes

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // --- 2. Make the JWT registration asynchronous ---
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule here
      inject: [ConfigService], // Inject the ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // <-- 3. Get secret from .env
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}