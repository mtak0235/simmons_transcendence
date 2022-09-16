import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async set(key: string, value: string) {
    await this.cacheManager.set(key, value, { ttl: 0 });
  }

  async get(key: string): Promise<string> {
    return (await this.cacheManager.get(key)) as string;
  }

  async delete(key: string) {
    await this.cacheManager.del(key);
  }
}
