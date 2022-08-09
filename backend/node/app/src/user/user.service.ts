import { Injectable } from '@nestjs/common';

export interface UserType {
  id: number;
  username: string;
  display_name: string;
  email: string;
  image_path: string;
  two_factor: boolean;
}

@Injectable()
export class UserService {
  private readonly users: Array<UserType> = [
    {
      id: 1,
      username: 'seonkim',
      display_name: 'seongsu',
      email: 'nfl1ryxditimo12@gmail.com',
      image_path:
        'https://postfiles.pstatic.net/MjAyMTEyMDdfNyAg/MDAxNjM4ODAzMDUzNzEw.BiEqas64eyldpkGJaRFrSF4gTFjezN8-KSEHsP0jjj4g.I50-74zGX91z3Rb0Nfd6NsE-_bVOoiDgzdGsl4DqTm4g.JPEG.singj1963/%EA%B0%84%EC%9E%A5%EA%B2%8C%EC%9E%A5.jpg?type=w773',
      two_factor: false,
    },
  ];

  async findOne(userId: string): Promise<UserType | null> {
    return this.users.find((user) => user.id === parseInt(userId, 10));
  }
}
