import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from '@auth/auth.service';
import { AuthController } from '@auth/auth.controller';
import { FtStrategy } from '@auth/strategy/ft.strategy';
import { UserModule } from '@user/user.module';

@Module({
  imports: [PassportModule.register({ session: true }), UserModule],
  controllers: [AuthController],
  providers: [AuthService, FtStrategy],
})
export class AuthModule {}
