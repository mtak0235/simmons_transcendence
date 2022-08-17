import { Module } from '@nestjs/common';

import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';
import { UtilModule } from '@util/util.module';
import { EventModule } from '@src/event/event.module';
import { FrontTestController } from './front-test/front-test.controller';

@Module({
  // imports: [UtilModule, AuthModule, UserModule, EventModule],
  imports: [],
  controllers: [FrontTestController],
  providers: [],
})
export class AppModule {}
