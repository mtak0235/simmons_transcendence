import { Module } from '@nestjs/common';

import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';
import { UtilModule } from '@util/util.module';
import { SocketModule } from '@socket/socket.module';

@Module({
  imports: [UtilModule, AuthModule, SocketModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
