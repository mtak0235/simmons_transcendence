import { Controller, Get, UseGuards, Req, Res, Post } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from '@auth/auth.service';
import { FtAuthGuard } from '@auth/guard/ft.guard';
import { JwtAuthGuard } from '@auth/guard/jwt.guard';
import { EmailAuthGuard } from '@auth/guard/email.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(FtAuthGuard)
  async login(@Req() req) {
    return req.user;
  }

  @Get('login/callback')
  @UseGuards(FtAuthGuard)
  async loginCallback(@Req() req, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.generateToken(
      req.user.id,
      !req.user.twoFactor,
      req.user.twoFactor,
    );

    res.cookie('access_token', token.accessToken);
    res.cookie('refresh_token', token.refreshToken);

    if (req.user.twoFactor) {
      res.cookie('code', token.codeToken);
      // todo: !req.user.twoFactor -> redirection http://host/auth/email
      res.status(200).send('2단계 인증 필요');
    } else {
      // todo: redirection main page 또는 socket page
      res.status(200).send('로그인 성공');
    }
  }

  @Get('email-verify')
  @UseGuards(JwtAuthGuard)
  @UseGuards(EmailAuthGuard)
  async verifyMailCode(@Req() req, @Res() res) {
    const token = await this.authService.generateToken(req.user.id, true);

    res.cookie('access_token', token.accessToken);
    res.cookie('refresh_token', token.refreshToken);

    res.status(200).send('이메일 인증 성공');
  }

  // todo: redis 연동해서 refresh 검증 로직 추가해야 할 지 생각해야 함
  // redis refresh token strategy 추가하는 것도 ㄱㅊ을듯
  @Post('token')
  @UseGuards(JwtAuthGuard)
  async refreshAccessToken(@Req() req, @Res() res) {
    const token = await this.authService.generateToken(req.user.id, true);

    res.cookie('access_token', token.accessToken);
    res.cookie('refresh_token', token.refreshToken);

    res.status(200).send('Access, Refresh 토큰 재발행 성공');
  }
}
