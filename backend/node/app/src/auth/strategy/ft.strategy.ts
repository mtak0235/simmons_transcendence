import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';

import { AuthService } from '@auth/auth.service';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID:
        '148ddcf771dcb6bffd09dc4a6705e891ba54c6abf9a475f8a03b021e8eb04b53',
      clientSecret:
        'c2d1e5ea4717bd5c2af2308c9f2d064b44ac031d8d3f6a3af9e7a430105be80c',
      callbackURL: 'http://localhost:5000/auth/login/callback',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = await this.authService.validateUser(profile['username']);

    if (!user) throw new ForbiddenException();

    return user;
  }
}
