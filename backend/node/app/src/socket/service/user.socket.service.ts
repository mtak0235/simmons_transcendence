import { BadRequestException, Injectable } from '@nestjs/common';

import { UserSocketStore } from '@socket/storage/user.socket.store';
import { STATUS_LAYER, UserDto } from '@socket/dto/user.socket.dto';
import Users from '@entity/user.entity';
import UserRepository from '@repository/user.repository';
import FollowRepository from '@repository/follow.repository';
import BLockRepository from '@repository/block.repository';
import Blocks from '@entity/block.entity';

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
    } else {
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

  async block(user: UserDto, targetId: number) {
    if (user.blocks.indexOf(targetId) === -1) {
      user.blocks.push(targetId);

      const block: Blocks = this.blockRepository.create({
        sourceId: user.userId,
        targetId,
      });
      await this.blockRepository.save(block);
    }
  }

  isFollowing(follows: number[], targetId: number) {
    return this.userSocketStore.isFollowing(follows, targetId);
  }

  async unfollow(user: UserDto, targetId: number) {
    const followIdx = user.follows.indexOf(targetId);

    if (followIdx !== -1) {
      await this.followRepository.delete({
        sourceId: user.userId,
        targetId,
      });
      user.follows.slice(followIdx);
    } else {
      throw new BadRequestException();
    }
  }

  async follow(user: UserDto, targetId: number) {
    const blockIdx = user.blocks.indexOf(targetId);

    if (blockIdx !== -1) {
      await this.blockRepository.delete({
        sourceId: user.userId,
        targetId,
      });
      user.blocks.slice(blockIdx);
    }

    const follow = this.followRepository.create({
      sourceId: user.userId,
      targetId,
    });
    await this.followRepository.save(follow);

    user.follows.push(targetId);
  }
}
