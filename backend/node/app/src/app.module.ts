import { Module } from '@nestjs/common';

import ConfigModule from '@config/config.module';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';

@Module({
  imports: [ConfigModule(), AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
