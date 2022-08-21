import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { EncryptionService } from '@util/encryption.service';
import { UserService, UserType } from '@user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('authConfig.jwt'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any): Promise<UserType> {
    const now = Date.parse(Date()) / 1000;

    if (req.url !== '/v0/auth/token' && now > payload.exp)
      throw new UnauthorizedException();

    // todo: delete: 개발용 코드
    if (payload.type === 'dev')
      return await this.userService.findUserById(2269);

    const userId = parseInt(
      (await this.encryptionService.decrypt(payload.id)).toString(),
      10,
    );

    if (isNaN(userId)) throw new UnauthorizedException();

    return await this.userService.findUserById(userId);
  }
}
