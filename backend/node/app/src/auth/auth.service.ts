import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

import { UserService } from '@user/user.service';
import { EncryptionService } from '@util/encryption.service';
import { RedisService } from '@util/redis.service';

interface TokenType {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly encryptionService: EncryptionService,
    private readonly redisService: RedisService,
  ) {}

  async generateToken(id: number): Promise<TokenType> {
    return {
      accessToken: this.jwtService.sign({ id: id, type: 'access' }),
      refreshToken: this.jwtService.sign({}, { expiresIn: '14d' }),
    };
  }

  generateSignCode(id: number): string {
    return this.jwtService.sign({ id: id, type: 'sign' }, { expiresIn: '1d' });
  }

  async generateMailCode(id: number): Promise<string> {
    const code = await this.sendMail(id);

    const payload = {
      id: id,
      code: await this.encryptionService.hash(code),
    };

    return this.jwtService.sign(payload);
  }

  async sendMail(id: number): Promise<string> {
    const user = await this.userService.findUserById(id);
    const number: number = Math.floor(100000 + Math.random() * 900000);

    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get('smtpConfig.user'),
      subject: '이메일 인증 요청 메일입니다.',
      html: `<h3>이메일 인증은 5분 내에 진행해 주세요.</h3>6자리 인증 코드 : <b> ${number}</b>`,
    });

    return String(number);
  }

  async expireFirstAccess(id: number) {
    const user = await this.userService.findUserById(id);

    if (user.firstAccess === true)
      await this.userService.deleteUserByEntity(user);
  }

  async logout(id: number) {
    await this.redisService.delete(id.toString());
  }
}
