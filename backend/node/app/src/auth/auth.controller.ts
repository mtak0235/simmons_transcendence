import { Controller, Get, UseGuards, Req } from '@nestjs/common';

import { AuthService } from '@auth/auth.service';
import { FtAuthGuard } from '@auth/guard/ft.guard';

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
  async loginCallback(@Req() req) {
    // console.log(req.user);
    return 'hello';
  }
}
