import { Injectable, Logger } from '@nestjs/common';

import { UserSocketStore } from '@socket/storage/user.socket.store';
import { STATUS_LAYER, UserDto } from '@socket/dto/user.socket.dto';
import Users from '@entity/user.entity';
import UserRepository from '@repository/user.repository';
import FollowRepository from '@repository/follow.repository';
import BLockRepository from '@repository/block.repository';
import { Client } from '@socket/socket.gateway';
import { BlockBuilder } from '@entity/block.entity';

@Injectable()
export class UserSocketService {
  private logger: Logger = new Logger('SocketGateway');
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

      // blocks: blocks.map((value) => value.targetId),
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

  async block(client: Client, targetId: number) {
    if (this.userStore.isBlocking(client.user, targetId) == false) {
      this.userStore.addBlock(client.user, targetId);
      const blocks = new BlockBuilder()
        .sourceId(client.user.userId)
        .targetId(targetId)
        .build();
      await this.blockRepository.save(blocks);
    }
    if (this.userStore.isFollowing(client.user, targetId)) {
      this.friendChanged(client, targetId, false);
    }
  }

  friendChanged(client: Client, targetId: number, isFollowing: boolean) {
    if (isFollowing == true) {
      this.userStore.addFollow(client.user, targetId);
      if (this.userStore.isBlocking(client.user, targetId)) {
        this.userStore.deleteBlock(client.user, targetId);
      }
    } else if (this.userStore.isFollowing(client.user, targetId)) {
      this.userStore.deleteFollow(client.user, targetId);
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
