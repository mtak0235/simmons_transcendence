import { Injectable } from '@nestjs/common';

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

  async findOne(userId: string | number): Promise<UserType | null> {
    if (typeof userId === 'string') userId = parseInt(userId, 10);

    return this.users.find((user) => user.id === userId);
  }
}
