import { Injectable, Logger } from '@nestjs/common';

import { UserSocketStore } from '@socket/storage/user.socket.store';
import { STATUS_LAYER, UserDto } from '@socket/dto/user.socket.dto';
import Users from '@entity/user.entity';
import UserRepository from '@repository/user.repository';
import FollowRepository from '@repository/follow.repository';
import BLockRepository from '@repository/block.repository';
import { SocketInstance } from '@socket/socket.gateway';
import { BlockBuilder } from '@entity/block.entity';

@Injectable()
export class UserSocketService {
  private logger: Logger = new Logger('SocketGateway');
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

  async block(client: SocketInstance, targetId: number) {
    if (this.userSocketStore.isBlocking(client.user, targetId) == false) {
      this.userSocketStore.addBlock(client.user, targetId);
      const blocks = new BlockBuilder()
        .sourceId(client.user.userId)
        .targetId(targetId)
        .build();
      await this.blockRepository.save(blocks);
    }
    if (this.userSocketStore.isFollowing(client.user, targetId)) {
      this.friendChanged(client, targetId, false);
    }
  }

  friendChanged(
    client: SocketInstance,
    targetId: number,
    isFollowing: boolean,
  ) {
    if (isFollowing == true) {
      this.userSocketStore.addFollow(client.user, targetId);
      if (this.userSocketStore.isBlocking(client.user, targetId)) {
        this.userSocketStore.deleteBlock(client.user, targetId);
      }
    } else if (this.userSocketStore.isFollowing(client.user, targetId)) {
      this.userSocketStore.deleteFollow(client.user, targetId);
    } else {
      // unfollow but tried unfollow
      return;
    }
    client
      .to('room:user:' + client.user.userId.toString())
      .emit('friendChanged', {
        userId: client.user.userId,
        targetId,
        isFollowing,
      });
  }
}
