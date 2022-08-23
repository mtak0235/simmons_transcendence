import { Injectable, Logger } from '@nestjs/common';

import { UserSocketStore } from '@socket/storage/user.socket.store';
import { STATUS_LAYER, UserDto } from '@socket/dto/user.socket.dto';
import Users from '@entity/user.entity';
import UserRepository from '@repository/user.repository';
import FollowRepository from '@repository/follow.repository';
import BLockRepository from '@repository/block.repository';
import { SocketInstance } from '@socket/socket.gateway';

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
    console.log(1);
    if (userInfo instanceof Users) {
      console.log(2);
      const follows = await this.followRepository.findFolloweeList(userInfo.id);
      const blocks = await this.blockRepository.findBlockList(userInfo.id);
      console.log(3);

      const user: UserDto = {
        userId: userInfo.id,
        username: userInfo.username,
        status: 'online',
        follows: follows.map((value) => value.targetId),
        blocks: blocks.map((value) => value.targetUsers.id),
      };
      console.log(4);

      this.userSocketStore.save(user);
      console.log(5);

      return user;
    } else if (userInfo instanceof UserDto) {
      const follows = await this.followRepository.findFolloweeList(
        userInfo.userId,
      );
      console.log(6);

      userInfo.follows = follows.map((value) => value.targetId);
      this.switchStatus(userInfo, 'online');
      console.log(7);

      return userInfo;
    }
  }

  switchStatus(user: UserDto, status: STATUS_LAYER) {
    this.userSocketStore.update(user, { status: status });
  }

  async block(client: SocketInstance, targetId: number) {
    if (this.userSocketStore.isBlocking(client.user, targetId) == false) {
      this.userSocketStore.addBlock(client.user, targetId);
      await this.blockRepository.save({ userId: client.user.userId, targetId });
    }
    if (this.userSocketStore.isFollowing(client.user, targetId)) {
      await this.friendChanged(client, targetId, false);
    }
  }

  async friendChanged(
    client: SocketInstance,
    targetId: number,
    isFollowing: boolean,
  ) {
    if (isFollowing == true) {
      this.userSocketStore.addFollow(client.user, targetId);
      await this.followRepository.save({
        sourceId: client.user.userId,
        targetId,
      });
      if (this.userSocketStore.isBlocking(client.user, targetId)) {
        this.userSocketStore.deleteBlock(client.user, targetId);
        await this.blockRepository.delete({
          sourceId: client.user.userId,
          targetId,
        });
      }
    } else if (this.userSocketStore.isFollowing(client.user, targetId)) {
      this.userSocketStore.deleteFollow(client.user, targetId);
      await this.followRepository.delete({
        sourceId: client.user.userId,
        targetId,
      });
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
