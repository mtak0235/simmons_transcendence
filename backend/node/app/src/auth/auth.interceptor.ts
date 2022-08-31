import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

import { RedisService } from '@util/redis.service';
import { AuthService } from '@auth/auth.service';
import { AuthResponseDto } from '@auth/auth.dto';

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
    return next.handle().pipe(
      map(async (result: AuthResponseDto) => {
        const res: Response = context.switchToHttp().getResponse();
        const userId: number = context.switchToHttp().getRequest().user.id;

        if (result.firstAccess) {
          res.cookie('sign', this.authService.generateSignCode(userId));
        } else if (result.twoFactor) {
          res.cookie('code', await this.authService.generateMailCode(userId));
        } else if (result.token) {
          const { accessToken, refreshToken } =
            await this.authService.generateToken(userId);
          res.cookie('access_token', accessToken);
          res.cookie('refresh_token', refreshToken);
          await this.redisService.set(userId.toString(), refreshToken);
        }

        res.status(result.status).json({
          status: result.status,
          message: result.message,
        });
      }),
    );
  }
}
