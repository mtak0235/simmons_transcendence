import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { UserService } from '@user/user.service';
import { JwtAuthGuard } from '@auth/guard/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async findOneUser(
    @Param('userId', ParseIntPipe, ValidationPipe) userId,
    number,
    @Req() req,
    @Res() res,
  ) {
    if (userId === req.user.id) res.status(200).json(req.user);
    else return await this.userService.findUserById(userId);
  }

  @Patch('two-factor')
  @UseGuards(JwtAuthGuard)
  async switchTwoFactor(@Req() req, @Res() res) {
    res.status(200).json({
      twoFactor: await this.userService.switchTwoFactor(req.user),
    });
  }
}
