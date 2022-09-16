import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { EncryptionService } from '@util/encryption.service';
import { UserService } from '@user/user.service';

@Injectable()
export class EmailStrategy extends PassportStrategy(Strategy, 'email') {
  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('authConfig.jwt'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const code: any = req.query['code'];
    const hash: string = payload.code;

    if (!code || !(await this.encryptionService.compare(code, hash)))
      throw new UnauthorizedException();

    return await this.userService.findUserById(payload.id);
  }
}
