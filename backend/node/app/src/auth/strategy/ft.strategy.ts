import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '@auth/auth.service';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('ftConfig.uid'),
      clientSecret: configService.get('ftConfig.secret'),
      callbackURL: configService.get('ftConfig.redirectUri'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = await this.authService.validateUser(profile['username']);

    if (!user) throw new ForbiddenException();

    return user;
  }
}
