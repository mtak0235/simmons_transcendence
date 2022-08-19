import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
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

    const userId = (
      await this.encryptionService.decrypt(payload.id)
    ).toString();

    return await this.userService.findOne(1); // todo: update: parseInt(userId, 10)
  }
}
