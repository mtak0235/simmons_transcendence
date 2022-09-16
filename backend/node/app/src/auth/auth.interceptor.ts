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
import { AuthResponseDto, TokenDto } from '@auth/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    return next.handle().pipe(
      map(async (result: AuthResponseDto) => {
        const res: Response = context.switchToHttp().getResponse();
        const userId: number = context.switchToHttp().getRequest().user.id;
        const token: TokenDto = {};

        res.status(result.status);

        if (result.firstAccess) {
          token.sign = this.authService.generateSignCode(userId);
        } else if (result.twoFactor) {
          token.code = await this.authService.generateMailCode(userId);
        } else if (result.token) {
          const { accessToken, refreshToken } =
            await this.authService.generateToken(userId);
          token.accessToken = accessToken;
          token.refreshToken = refreshToken;
          await this.redisService.set(userId.toString(), token.refreshToken);
        }

        if (result.status === 302) {
          res.redirect(
            this.configService.get('serverConfig.clientUrl') +
              `?${new URLSearchParams({ ...token }).toString()}`,
          );
        } else {
          return {
            status: result.status,
            token,
          };
        }
      }),
    );
  }
}
