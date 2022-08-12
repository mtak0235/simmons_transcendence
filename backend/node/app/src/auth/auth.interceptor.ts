import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { RedisService } from '@util/redis.service';
import { AuthService } from '@auth/auth.service';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const userId = parseInt(req.user['id'], 10);

    if (req.user['requireTwoFactor'] === true) {
      res.cookie('code', await this.authService.generateMailCode(userId));
    } else {
      const { accessToken, refreshToken } =
        await this.authService.generateToken(userId);
      res.cookie('access_token', accessToken);
      res.cookie('refresh_token', refreshToken);
      console.log(userId, typeof userId, typeof String(userId));
      await this.redisService.set(userId.toString(), refreshToken);
    }

    console.log(res.getHeaders());
    return next.handle();
  }
}
