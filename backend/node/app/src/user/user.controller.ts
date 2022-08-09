import { Controller, Get, Param, Req } from '@nestjs/common';

import { UserService } from '@user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async findOneUser(@Param('userId') userId: string, @Req() req) {
    console.log(req.user);
    return await this.userService.findOne(userId);
  }
}
