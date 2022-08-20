import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import Users from '@entity/user.entity';
import UserRepository from '@repository/user.repository';

export interface UserType {
  id: number;
  username: string;
  displayName: string;
  email: string;
  imagePath: string;
  twoFactor: boolean;
}

@Injectable()
export class UserService {
  private readonly users: Array<UserType> = [
    {
      id: 1,
      username: 'seonkim',
      displayName: 'seongsu',
      email: 'vollz2g@gmail.com',
      imagePath:
        'https://postfiles.pstatic.net/MjAyMTEyMDdfNyAg/MDAxNjM4ODAzMDUzNzEw.BiEqas64eyldpkGJaRFrSF4gTFjezN8-KSEHsP0jjj4g.I50-74zGX91z3Rb0Nfd6NsE-_bVOoiDgzdGsl4DqTm4g.JPEG.singj1963/%EA%B0%84%EC%9E%A5%EA%B2%8C%EC%9E%A5.jpg?type=w773',
      twoFactor: true,
    },
  ];

  constructor(private readonly userRepository: UserRepository) {}

  async findUserByUsername(username: string): Promise<Users | null> {
    const user = await this.userRepository.findUser('username', username);

    if (!user) throw new ForbiddenException();

    return user;
  }

  async findUserById(userId: string | number): Promise<UserType | null> {
    if (typeof userId === 'string') userId = parseInt(userId, 10);

    const user = this.users.find((user) => user.id === userId);

    if (!user) throw new BadRequestException();

    return user;
  }
}
