import { Module } from '@nestjs/common';

import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';
import { UtilModule } from '@util/util.module';
import { EventModule } from '@event/event.module';

@Module({
  imports: [UtilModule, AuthModule, UserModule, EventModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
