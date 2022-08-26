import { ConflictException, Injectable } from '@nestjs/common';

import { UserSocketStore } from '@socket/storage/user.socket.store';
import { STATUS_LAYER, UserDto } from '@socket/dto/user.socket.dto';
import Users from '@entity/user.entity';
import UserRepository from '@repository/user.repository';
import FollowRepository from '@repository/follow.repository';
import BLockRepository from '@repository/block.repository';
import { ClientInstance } from '@socket/socket.gateway';
import Blocks from '@entity/block.entity';
import { Server } from 'socket.io';

@Injectable()
export class UserSocketService {
  constructor(
    private readonly userSocketStore: UserSocketStore,
    private readonly userRepository: UserRepository,
    private readonly followRepository: FollowRepository,
    private readonly blockRepository: BLockRepository,
  ) {}

  async connect(userInfo: Users | UserDto): Promise<UserDto> {
    if (userInfo instanceof Users) {
      const follows = await this.followRepository.findFolloweeList(userInfo.id);
      const blocks = await this.blockRepository.findBlockList(userInfo.id);

      const user: UserDto = {
        userId: userInfo.id,
        username: userInfo.username,
        status: 'online',
        follows: follows.map((value) => value.targetId),
        blocks: blocks.map((value) => value.targetId),
      };

      this.userSocketStore.save(user);

      return user;
    } else if (userInfo instanceof UserDto) {
      const follows = await this.followRepository.findFolloweeList(
        userInfo.userId,
      );

      userInfo.follows = follows.map((value) => value.targetId);
      this.switchStatus(userInfo, 'online');

      return userInfo;
    }
  }

  switchStatus(user: UserDto, status: STATUS_LAYER) {
    this.userSocketStore.update(user, { status: status });
  }

  async block(
    blocks: number[],
    follows: number[],
    sourceId: number,
    targetId: number,
  ) {
    if (this.userSocketStore.isBlocking(blocks, targetId) == false) {
      this.userSocketStore.addBlock(blocks, targetId);
      const block: Blocks = this.blockRepository.create({
        sourceId: sourceId,
        targetId,
      });
      await this.blockRepository.save(block);
    }
  }

  isFollowing(follows: number[], targetId: number) {
    return this.userSocketStore.isFollowing(follows, targetId);
  }

  async unfollow(follows: number[], targetId: number, sourceId: number) {
    if (this.userSocketStore.isFollowing(follows, targetId)) {
      this.userSocketStore.deleteFollow(follows, targetId);
      await this.followRepository.delete({
        sourceId,
        targetId,
      });
    } else {
      throw new ConflictException(['you are already unfollowing him']);
    }
  }

  async follows(
    follows: number[],
    targetId: number,
    sourceId: number,
    blocks: number[],
  ) {
    this.userSocketStore.addFollow(follows, targetId);
    const follow = this.followRepository.create({
      sourceId: sourceId,
      targetId,
    });
    await this.followRepository.save(follow);
    if (this.userSocketStore.isBlocking(blocks, targetId)) {
      this.userSocketStore.deleteBlock(blocks, targetId);
      await this.blockRepository.delete({
        sourceId: sourceId,
        targetId,
      });
    }
  }
}
