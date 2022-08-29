import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';

import { RedisService } from '@util/redis.service';
import { AuthService } from '@auth/auth.service';
import Users from '@entity/user.entity';

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
    const req = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const user: Users = req.user;

    if (
      req.url === '/auth/token' &&
      req.cookies['refresh_token'] !==
        (await this.redisService.get(user.id.toString()))
    )
      throw new UnauthorizedException();

    if (user.firstAccess) {
      res.cookie(
        'sign',
        (await this.authService.generateToken(user.id)).accessToken,
      );
    } else if (req.user['requireTwoFactor'] === true) {
      res.cookie('code', await this.authService.generateMailCode(user.id));
    } else {
      const { accessToken, refreshToken } =
        await this.authService.generateToken(user.id);
      res.cookie('access_token', accessToken);
      res.cookie('refresh_token', refreshToken);
      await this.redisService.set(user.id.toString(), refreshToken);
    }
    return next.handle();
  }
}
