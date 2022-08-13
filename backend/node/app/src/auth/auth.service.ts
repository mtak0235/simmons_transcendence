import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

import { UserService, UserType } from '@user/user.service';
import { EncryptionService } from '@util/encryption.service';

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
  ) {}

  // todo: 추후 db 조회로 변경될 예정이라 Promise 반환
  async validateUser(username: string): Promise<UserType> {
    // todo: db에서 데이터 validating 하는 부분
    const user = await this.userService.findOne('1');
    return user;
  }

  async generateToken(id: number): Promise<TokenType> {
    const encryptId = await this.encryptionService.encrypt(String(id));

    return {
      accessToken: this.jwtService.sign({ id: encryptId }),
      refreshToken: this.jwtService.sign({}, { expiresIn: '14d' }),
    };
  }

  async generateMailCode(id: number): Promise<string> {
    const code = await this.sendMail(id);
    const encryptId = await this.encryptionService.encrypt(String(id));
    const payload = {
      id: encryptId,
      code: await this.encryptionService.hash(code),
    };

    return this.jwtService.sign(payload);
  }

  async sendMail(id: number): Promise<string> {
    try {
      const user = await this.userService.findOne(id);
      const number: number = Math.floor(100000 + Math.random() * 900000);

      await this.mailerService.sendMail({
        to: user.email,
        from: this.configService.get('smtpConfig.user'),
        subject: '이메일 인증 요청 메일입니다.',
        html: `<h3>이메일 인증은 5분 내에 진행해 주세요.</h3>6자리 인증 코드 : <b> ${number}</b>`,
      });

      return String(number);
    } catch (err) {
      console.log(err);
    }
  }
}
