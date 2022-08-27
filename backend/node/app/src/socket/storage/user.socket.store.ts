import { Injectable } from '@nestjs/common';

import {
  UserDto,
  UserInfoDto,
  UserUpdateDto,
} from '@socket/dto/user.socket.dto';

@Injectable()
export class UserSocketStore {
  private users: Map<number, UserDto> = new Map();

  constructor() {
    this.users.set(2000, {
      userId: 2000,
      username: 'unknown',
      status: 'online',
      follows: [],
      blocks: [],
    }); // todo: delete: 개발용 코드
  }

  find(userId: number): UserDto {
    return this.users.get(userId);
  }

  findAll(): UserDto[] {
    return [...this.users.values()];
  }

  findAllInfo(userId: number): UserInfoDto[] {
    return [...this.users.values()]
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
    this.users.set(user.userId, user);
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

  delete(userId: number) {
    this.users.delete(userId);
  }

  deleteFollow(follows: number[], targetId: number) {
    follows.slice(follows.indexOf(targetId));
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
    blocks.slice(blocks.indexOf(targetId));
  }
}
