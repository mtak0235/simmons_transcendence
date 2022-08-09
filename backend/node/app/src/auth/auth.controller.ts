import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
  Body,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from '@auth/auth.service';
import { FtAuthGuard } from '@auth/guard/ft.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '@auth/guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('login')
  @UseGuards(FtAuthGuard)
  async login(@Req() req) {
    return req.user;
  }

  @Get('login/callback')
  @UseGuards(FtAuthGuard)
  async loginCallback(@Req() req, @Res({ passthrough: true }) res: Response) {
    const token = this.authService.generateToken(req.user);

    // todo: cookie expireIn 추가 해야함
    res.cookie('access_token', token.accessToken);
    res.cookie('refresh_token', token.refreshToken);

    if (req.user.two_factor === false) res.cookie('two_factor', true);

    res.status(200).json({});
  }

  // todo: redis 연동해서 refresh 검증 로직 추가해야 할 지 생각해야 함
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refreshAccessToken(@Req() req, @Res() res) {
    const token = this.authService.generateToken(req.user);

    res.cookie('access_token', token.accessToken);
    res.cookie('refresh_token', token.refreshToken);

    res.status(200).json({});
  }
}
