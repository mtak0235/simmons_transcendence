import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { AuthService } from '@auth/auth.service';
import { AuthController } from '@auth/auth.controller';
import { FtStrategy } from '@auth/strategy/ft.strategy';
import { UserModule } from '@user/user.module';
import { JwtStrategy } from '@auth/strategy/jwt.strategy';
import { EmailStrategy } from '@auth/strategy/email.strategy';

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
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          host: 'smtp.google.com',
          port: 587,
          secure: true,
          auth: {
            type: 'OAuth2',
            user: configService.get('smtpConfig.user'),
            clientId: configService.get('smtpConfig.uid'),
            clientSecret: configService.get('smtpConfig.secret'),
            refreshToken: configService.get('smtpConfig.token'),
          },
        },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FtStrategy, JwtStrategy, EmailStrategy],
  exports: [AuthService],
})
export class AuthModule {}
