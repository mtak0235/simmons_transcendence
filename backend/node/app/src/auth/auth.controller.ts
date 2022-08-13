import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';

import { FtAuthGuard } from '@auth/guard/ft.guard';
import { JwtAuthGuard } from '@auth/guard/jwt.guard';
import { EmailAuthGuard } from '@auth/guard/email.guard';
import { TokenInterceptor } from '@auth/auth.interceptor';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Get('login')
  @UseGuards(FtAuthGuard)
  async login(@Req() req) {
    return req.user;
  }

  @Get('login/callback')
  @UseGuards(FtAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async loginCallback(@Req() req, @Res({ passthrough: true }) res: Response) {
    // todo: redirection main page 또는 socket page
    if (!req.user.requireTwoFactor) res.status(200).send('로그인 성공');
    // todo: !req.user.twoFactor -> redirection http://host/auth/email
    else {
      req.user.requireTwoFactor = false;
      res.status(201).send('2단계 인증 필요');
    }
  }

  @Get('email-verify')
  @UseGuards(EmailAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async verifyMailCode(@Req() req, @Res() res) {
    res.status(200).send('이메일 인증 성공');
  }

  // todo: redis 연동해서 refresh 검증 로직 추가해야 할 지 생각해야 함
  // redis refresh token strategy 추가하는 것도 ㄱㅊ을듯
  @Post('token')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async refreshAccessToken(@Req() req, @Res() res) {
    res.status(200).send('Access, Refresh 토큰 재발행 성공');
  }
}
