import { BadRequestException, Injectable } from '@nestjs/common';
import Users from '@entity/user.entity';
import UserRepository from '@repository/user.repository';
import { UserAccessDto, UserSignDto } from '@user/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserByUsername(username: string): Promise<Users | null> {
    return await this.userRepository.findUser('username', username);
  }

  async findUserById(userId: number): Promise<Users | null> {
    const user = await this.userRepository.findUser('id', userId);

    if (!user) throw new BadRequestException();

    return user;
  }

  async createUser(userSignDto: UserSignDto) {
    const user = this.userRepository.create();

    user.id = userSignDto.id;
    user.username = userSignDto.username;
    user.displayName = userSignDto.displayName;
    user.email = userSignDto.email;
    user.imagePath = userSignDto.imagePath;

    await this.userRepository.save(userSignDto);

    return user;
  }

  async firstAccess(userId: number, userAccessDto: UserAccessDto) {
    const user = await this.findUserById(userId);

    user.firstAccess = false;

    await this.userRepository.update(userAccessDto, user);

    console.log(await this.findUserById(85274));
  }

  async switchTwoFactor(user: Users): Promise<boolean> {
    user.twoFactor = !user.twoFactor;
    await this.userRepository.save(user);

    return user.twoFactor;
  }
}
