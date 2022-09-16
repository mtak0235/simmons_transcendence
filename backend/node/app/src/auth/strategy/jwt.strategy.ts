import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { EncryptionService } from '@util/encryption.service';
import { UserService } from '@user/user.service';
import Users from '@entity/user.entity';
import { AuthService } from '@auth/auth.service';
import { RedisService } from '@util/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('authConfig.jwt'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any): Promise<Users> {
    const now = Date.parse(Date()) / 1000;

    if (
      (req.url !== '/v0/auth/login/access' && payload.type === 'sign') ||
      (req.url === '/v0/auth/login/access' && payload.type === 'access')
    )
      throw new UnauthorizedException();

    if (req.url !== '/v0/auth/token' && now > payload.exp) {
      if (req.url === '/v0/auth/login/access')
        await this.authService.expireFirstAccess(payload.id);
      throw new UnauthorizedException();
    }

    if (
      req.url === '/v0/auth/token' &&
      req.cookies['refresh_token'] !==
        (await this.redisService.get(payload.id.toString()))
    ) {
      throw new UnauthorizedException();
    }

    return await this.userService.findUserById(payload.id);
  }
}
