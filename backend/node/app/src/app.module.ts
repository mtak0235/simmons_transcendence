import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';
import envConfig from '@config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
