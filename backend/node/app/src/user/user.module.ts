import { Module } from '@nestjs/common';

import { UserController } from '@user/user.controller';
import { UserService } from '@user/user.service';
import { UserResponseInterceptor } from '@user/user.interceptor';

@Module({
  controllers: [UserController],
  providers: [UserService, UserResponseInterceptor],
  exports: [UserService],
})
export class UserModule {}
