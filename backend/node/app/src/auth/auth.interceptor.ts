import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';

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
    const userId: number = req.user['id'];

    if (
      req.url === '/auth/token' &&
      req.cookies.refresh_token !==
        (await this.redisService.get(userId.toString()))
    )
      throw new UnauthorizedException();

    if (req.user['requireTwoFactor'] === true) {
      res.cookie('code', await this.authService.generateMailCode(userId));
    } else {
      const { accessToken, refreshToken } =
        await this.authService.generateToken(userId);
      res.cookie('access_token', accessToken);
      res.cookie('refresh_token', refreshToken);
      await this.redisService.set(userId.toString(), refreshToken);
    }
    return next.handle();
  }
}
