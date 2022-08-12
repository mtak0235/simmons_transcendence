import { Module } from '@nestjs/common';

import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';
import { UtilModule } from '@util/util.module';

@Module({
  imports: [UtilModule, AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
