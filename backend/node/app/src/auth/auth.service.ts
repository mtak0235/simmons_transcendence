import { Injectable } from '@nestjs/common';
import { UserService, UserType } from '@user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string): Promise<UserType> {
    // todo: db에서 데이터 validating 하는 부분
    const user = await this.userService.findOne('1');
    return user;
  }

  generateToken(user: UserType) {
    return {
      accessToken: this.jwtService.sign({ id: user.id }),
      refreshToken: this.jwtService.sign({}, { expiresIn: '30d' }),
    };
  }
}
