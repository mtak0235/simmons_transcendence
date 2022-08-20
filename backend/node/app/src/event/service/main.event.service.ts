import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { EncryptionService } from '@util/encryption.service';

@Injectable()
export class MainEventService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async verifyUser(token: any): Promise<number> {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get('authConfig.jwt'),
    });
    return parseInt(
      (await this.encryptionService.decrypt(payload.id)).toString(),
      10,
    );
  }
}
