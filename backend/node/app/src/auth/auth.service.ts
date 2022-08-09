import { Injectable } from '@nestjs/common';
import { UserService, UserType } from '@user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(username: string): Promise<UserType> {
    // todo: db에서 데이터 validating 하는 부분
    const user = await this.userService.findOne('2');
    return user;
  }
}
