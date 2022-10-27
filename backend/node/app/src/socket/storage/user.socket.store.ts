import { Injectable } from '@nestjs/common';

import {
  UserDto,
  UserInfoDto,
  UserUpdateDto,
} from '@socket/dto/user.socket.dto';
import BaseSocketStore from '@socket/storage/base.socket.store';

@Injectable()
export class UserSocketStore extends BaseSocketStore<UserDto> {
  constructor() {
    super();
  }

  findAll(): UserDto[] {
    return [...this.values()];
  }

  findAllInfo(userId: number): UserInfoDto[] {
    return [...this.values()]
      .map((user: UserDto): UserInfoDto => {
        if (userId !== user.userId && user.status !== 'offline')
          return {
            userId: user.userId,
            username: user.username,
            status: user.status,
          };
      })
      .filter((user) => user);
  }

  save(user: UserDto) {
    this.set(user.userId, user);
  }

  update(user: UserDto, updateData: UserUpdateDto) {
    for (const key in updateData) user[key] = updateData[key];
  }

  addBlock(blocks: number[], targetId: number) {
    blocks.push(targetId);
  }
  addFollow(follows: number[], targetId: number) {
    follows.push(targetId);
  }

  deleteFollow(follows: number[], targetId: number) {
    follows.splice(follows.indexOf(targetId), 1);
  }

  isFollowing(follows: number[], targetId: number) {
    const numbers = follows.filter((val) => val == targetId);
    return Boolean(numbers.length);
  }

  isBlocking(blocks: number[], targetId: number): boolean {
    const numbers = blocks.filter((val) => val == targetId);
    return Boolean(numbers.length);
  }

  deleteBlock(blocks: number[], targetId: number) {
    blocks.splice(blocks.indexOf(targetId), 1);
  }
}
