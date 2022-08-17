import { CacheModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
//import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-ioredis';
import { envConfig, envValidation } from '@util/env.service';
import { RedisService } from '@util/redis.service';
import { EncryptionService } from '@util/encryption.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '@util/entity/index';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('dbConfig.host'),
        port: configService.get('dbConfig.port'),
        username: configService.get('dbConfig.username'),
        password: configService.get('dbConfig.password'),
        database: configService.get('dbConfig.name'),
        charset: 'utf8mb4_general_ci',
        timezone: '+09:00',
        synchronize: false, // todo: production environ = false
        logging: ['error'],
        logger: 'file',
        maxQueryExecutionTime: 2000,
        entities: entities,
      }),
    }),
  ],
  providers: [RedisService, EncryptionService],
  exports: [ConfigModule, RedisService, EncryptionService],
})
export class UtilModule {}
