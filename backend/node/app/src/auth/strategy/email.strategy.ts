import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmailStrategy extends PassportStrategy(Strategy, 'email') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('code'),
      ignoreExpiration: false,
      secretOrKey: configService.get('authConfig.jwt'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const code: any = req.query.code;
    const hash: string = payload.code;

    if (!code || !(await bcrypt.compare(code, hash)))
      throw new UnauthorizedException();

    return payload;
  }
}
