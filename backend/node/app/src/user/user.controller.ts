import {
  Controller,
  Get,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { UserService } from '@user/user.service';
import { JwtAuthGuard } from '@auth/guard/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async findOneUser(@Param('userId') userId: string, @Req() req) {
    if (parseInt(userId, 10) !== req.user.id) throw new UnauthorizedException();
    return await this.userService.findUserById(req.user.id);
  }
}
