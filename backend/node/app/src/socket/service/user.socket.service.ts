import { Injectable } from '@nestjs/common';

import { UserSocketStore } from '@socket/storage/user.socket.store';
import { STATUS_LAYER, UserDto } from '@socket/dto/user.socket.dto';
import Users from '@entity/user.entity';
import UserRepository from '@repository/user.repository';
import FollowRepository from '@repository/follow.repository';
import BLockRepository from '@repository/block.repository';

@Injectable()
export class UserSocketService {
  constructor(
    private readonly userStore: UserSocketStore,
    private readonly userRepository: UserRepository,
    private readonly followRepository: FollowRepository,
    private readonly blockRepository: BLockRepository,
  ) {}

  async connect(userInfo: Users): Promise<UserDto> {
    const follows = await this.followRepository.findFolloweeList(userInfo.id);
    const blocks = await this.blockRepository.findBlockList(userInfo.id);

    const user: UserDto = {
      userId: userInfo.id,
      username: userInfo.username,
      status: 'online',
      follows: follows.map((value) => value.targetId),
      blocks: blocks.map((value) => value.targetId),
    };

    this.userStore.save(user);

    return user;
  }

  async reconnect(user: UserDto): Promise<void> {
    const follows = await this.followRepository.findFolloweeList(user.userId);

    user.follows = follows.map((value) => value.targetId);
  }

  switchStatus(user: UserDto, status: STATUS_LAYER) {
    this.userStore.update(user, { status: status });
  }
}
