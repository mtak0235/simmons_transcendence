import { Injectable } from '@nestjs/common';

import {
  UserDto,
  UserInfoDto,
  UserUpdateDto,
} from '@socket/dto/user.socket.dto';

@Injectable()
export class UserSocketStore {
  private users: Map<number, UserDto> = new Map();

  find(userId: number): UserDto {
    return this.users.get(userId);
  }

  findAll(): UserDto[] {
    return [...this.users.values()];
  }

  findAllInfo(userId: number): UserInfoDto[] {
    return [...this.users.values()].map((user: UserDto): UserInfoDto => {
      if (userId !== user.userId && user.status !== 'offline')
        return {
          userId: user.userId,
          username: user.username,
          status: user.status,
        };
    });
  }

  save(user: UserDto) {
    this.users.set(user.userId, user);
  }

  update(user: UserDto, updateData: UserUpdateDto) {
    for (const key in updateData) user[key] = updateData[key];
  }

  addFollow(user: UserDto, targetId: number) {
    user.follows.push(targetId);
  }

  delete(userId: number) {
    this.users.delete(userId);
  }
}
