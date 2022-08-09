import { Module } from '@nestjs/common';

import { UserController } from '@user/user.controller';
import { UserService } from '@user/user.service';
import { JwtAuthGuard } from '@auth/guard/jwt.guard';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
