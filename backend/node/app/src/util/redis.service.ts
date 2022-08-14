import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async set(key: string, value: string) {
    await this.cacheManager.set(key, value, { ttl: 0 });
  }

  async get(key: string): Promise<string> {
    return (await this.cacheManager.get(key)) as string;
  }
}
