import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from '@auth/auth.service';
import { AuthController } from '@auth/auth.controller';
import { FtStrategy } from '@auth/strategy/ft.strategy';
import { UserModule } from '@user/user.module';
import { JwtStrategy } from '@auth/strategy/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('authConfig.jwt'),
        signOptions: { algorithm: 'HS256', expiresIn: '5m' },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FtStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
