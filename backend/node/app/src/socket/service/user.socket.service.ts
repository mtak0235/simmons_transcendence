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

      return userInfo;
    }
  }

  switchStatus(user: UserDto, status: STATUS_LAYER) {
    this.userSocketStore.update(user, { status: status });
  }
}
