import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  UseInterceptors,
  Param,
  UploadedFile,
  Delete,
} from '@nestjs/common';

import { FtAuthGuard } from '@auth/guard/ft.guard';
import { JwtAuthGuard } from '@auth/guard/jwt.guard';
import { EmailAuthGuard } from '@auth/guard/email.guard';
import { TokenInterceptor } from '@auth/auth.interceptor';
import { UserService } from '@user/user.service';
import { AuthService } from '@auth/auth.service';
import { UserAccessDto } from '@user/user.dto';
import { AuthResponseDto } from '@auth/auth.dto';
import Users from '@entity/user.entity';

// todo: delete: 테스트용 imports
import { InternalServerErrorException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('login')
  @UseGuards(FtAuthGuard)
  login(): AuthResponseDto {
    return { status: 200, message: 'OK' };
  }

  @Get('login/callback')
  @UseGuards(FtAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async loginCallback(@Req() req): Promise<AuthResponseDto> {
    const user: Users = req.user;

    if (user.firstAccess) {
      return { status: 201, message: '회원가입 완료', firstAccess: true };
    } else {
      if (!user['requireTwoFactor']) {
        return { status: 200, message: 'OK', token: true };
      } else {
        return { status: 202, message: '2단계 인증 필요', twoFactor: true };
      }
    }
  }

  @Post('login/access')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async firstAccess(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AuthResponseDto> {
    const user: Users = req.user;
    const userAccessDto: UserAccessDto = req.body;

    await this.userService.firstAccess(user, userAccessDto);
    if (file) await this.userService.uploadImage(user.id, file);

    if (!userAccessDto.twoFactor) {
      return { status: 200, message: 'OK', token: true };
    } else {
      return { status: 202, message: '2단계 인증 필요', twoFactor: true };
    }
  }

  @Get('email-verify')
  @UseGuards(EmailAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async verifyMailCode(): Promise<AuthResponseDto> {
    return { status: 200, message: 'OK', token: true };
  }

  @Get('token')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async refreshAccessToken(): Promise<AuthResponseDto> {
    return { status: 200, message: 'OK', token: true };
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    const user: Users = req.user;

    this.authService.logout(user.id);
    return { status: 200, message: 'OK' };
  }

  // todo: delete: 개발용 토큰 발급 API Controller
  @Get('test/:id')
  @UseInterceptors(TokenInterceptor)
  async testGenerator(
    @Req() req,
    @Param('id') id: number,
  ): Promise<AuthResponseDto> {
    if (!id) id = 85274;

    req.user = await this.userService.findUserById(id);

    if (process.env.NODE_ENV !== 'local' || !req.user)
      throw new InternalServerErrorException();

    return { status: 200, message: 'OK', token: true };
  }
}
