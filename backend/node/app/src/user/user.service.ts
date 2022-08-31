import { BadRequestException, Injectable } from '@nestjs/common';

import Users from '@entity/user.entity';
import UserRepository from '@repository/user.repository';
import { UserAccessDto, UserSignDto, UserUpdateDto } from '@user/user.dto';
import { ConfigService } from '@nestjs/config';
import { ImageService } from '@util/image.service';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly imageService: ImageService,
  ) {}

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
    user.firstAccess = true;
    user.twoFactor = false;

    await this.userRepository.save(userSignDto);

    return user;
  }

  async updateProfile(userId: number, userUpdateDto: UserUpdateDto) {
    await this.userRepository.updateProfile(userId, userUpdateDto);
  }

  async uploadImage(userId: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException();

    const extension = file.mimetype.replace(/image\//gi, '.');

    if (extension !== '.jpeg' && extension !== '.jpg' && extension !== '.png')
      throw new BadRequestException();

    const location = await this.imageService.uploadImage(
      'profile/' + userId.toString(),
      file.buffer,
      file.mimetype,
    );

    await this.userRepository.updateImagePath(userId, location);

    return location;
  }

  async deleteImage(userId: number) {
    await this.userRepository.updateImagePath(
      userId,
      this.configService.get('awsConfig.defaultProfileUrl'),
    );
  }

  async firstAccess(user: Users, userAccessDto: UserAccessDto) {
    userAccessDto.firstAccess = false;

    await this.userRepository.updateFirstAccess(user.id, userAccessDto);
  }

  async deleteUserByEntity(user: Users) {
    await this.userRepository.delete(user);
  }
}
