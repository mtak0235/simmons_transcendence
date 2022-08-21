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
  constructor(private readonly userRepository: UserRepository) {}

  async findUserByUsername(username: string): Promise<Users | null> {
    const user = await this.userRepository.findUser('username', username);

    if (!user) throw new ForbiddenException();

    return user;
  }

  async findUserById(userId: number): Promise<Users | null> {
    const user = await this.userRepository.findUser('id', userId);

    if (!user) throw new BadRequestException();

    return user;
  }

  async switchTwoFactor(user: Users): Promise<boolean> {
    user.twoFactor = !user.twoFactor;
    await this.userRepository.save(user);

    return user.twoFactor;
  }
}
