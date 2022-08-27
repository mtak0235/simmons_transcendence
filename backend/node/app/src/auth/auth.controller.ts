import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { Response } from 'express';

import { FtAuthGuard } from '@auth/guard/ft.guard';
import { JwtAuthGuard } from '@auth/guard/jwt.guard';
import { EmailAuthGuard } from '@auth/guard/email.guard';
import { TokenInterceptor } from '@auth/auth.interceptor';

// todo: delete: 테스트용 imports
import { JwtService } from '@nestjs/jwt';
import { InternalServerErrorException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {} // todo: delete: 개발용 Constructor

  @Get('login')
  @UseGuards(FtAuthGuard)
  async login(@Req() req) {
    return req.user;
  }

  @Get('login/callback')
  @UseGuards(FtAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async loginCallback(@Req() req, @Res({ passthrough: true }) res: Response) {
    if (!req.user.requireTwoFactor) res.status(200).send('로그인 성공');
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

  @Post('token')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async refreshAccessToken(@Req() req, @Res() res) {
    res.status(200).send('Access, Refresh 토큰 재발행 성공');
  }

  @Get('test/:id') // todo: delete: 개발용 토큰 발급 API Controller
  async testGenerator2(@Res() res, @Param('id') id: number) {
    if (process.env.NODE_ENV !== 'local')
      throw new InternalServerErrorException();

    if (!id) id = 2269;

    const accessToken = this.jwtService.sign(
      { id: id, type: 'dev' },
      { expiresIn: '365d' },
    );
    const refreshToken = this.jwtService.sign({}, { expiresIn: '365d' });

    res.cookie('access_token', accessToken);
    res.cookie('refresh_token', refreshToken);

    res.status(200).json({});
  }
}
