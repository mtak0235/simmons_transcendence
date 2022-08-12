import { CacheModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { envConfig, envValidation } from '@util/env.service';
import { RedisService } from '@util/redis.service';
import { EncryptionService } from '@util/encryption.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.dev'
          : process.env.NODE_ENV === 'production'
          ? '.env.prod'
          : '.env.test',
      load: [envConfig],
      validationSchema: envValidation(),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redisConfig.host'),
        port: configService.get('redisConfig.port'),
      }),
    }),
  ],
  providers: [RedisService, EncryptionService],
  exports: [ConfigModule, RedisService, EncryptionService],
})
export class UtilModule {}
