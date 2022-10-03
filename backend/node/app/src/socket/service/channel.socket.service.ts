import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import {
  ChannelCreateDto,
  ChannelDto,
  ChannelUpdateDto,
  MutedUser,
} from '@socket/dto/channel.socket.dto';
import GameLogRepository from '@repository/game.log.repository';
import { UserDto } from '@socket/dto/user.socket.dto';
import { UserSocketService } from '@socket/service/user.socket.service';
import { EncryptionService } from '@util/encryption.service';
import BLockRepository from '@repository/block.repository';
import { UserSocketStore } from '@socket/storage/user.socket.store';

@Injectable()
export class ChannelSocketService {
  constructor(
    private readonly channelSocketStore: ChannelSocketStore,
    private readonly userSocketStore: UserSocketStore,
    private readonly userSocketService: UserSocketService,
    private readonly gameLogRepository: GameLogRepository,
    private readonly blockRepository: BLockRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async createChannel(
    user: UserDto,
    channelCreateDto: ChannelCreateDto,
  ): Promise<ChannelDto> {
    return await this.channelSocketStore.create(channelCreateDto);
  }

  getChannel(channelId: number): ChannelDto {
    return this.channelSocketStore.find(channelId);
  }

  async updateChannel(
    channel: ChannelDto,
    channelUpdateDto: ChannelUpdateDto,
    password?: string,
  ) {
    for (const key in channelUpdateDto)
      channel.channelPublic[key] = channelUpdateDto[key];

    if (channel.channelPublic.accessLayer === 'protected') {
      if (!password) throw new BadRequestException();
      else
        channel.channelControl.password = await this.encryptionService.hash(
          password,
        );
    }
  }

  deleteChannel(channelId: number) {
    this.channelSocketStore.delete(channelId);
  }

  async inChannel(
    user: UserDto,
    channelId: number,
    password?: string,
  ): Promise<ChannelDto> {
    const channel: ChannelDto = this.channelSocketStore.find(channelId);

    if (!channel) throw new NotFoundException();

    console.log(user);

    // todo: if문 최적화, interceptor 로 뺴도 될듯
    if (
      (channel.channelControl.invited.indexOf(user.userId) === -1 &&
        ((channel.channelPublic.accessLayer === 'protected' &&
          !(await this.encryptionService.compare(
            password,
            channel.channelControl.password,
          ))) ||
          channel.channelPublic.accessLayer === 'private')) ||
      channel.channelControl.kickedOutUsers.indexOf(user.userId) !== -1
    )
      throw new ForbiddenException();

    channel.channelControl.invited = channel.channelControl.invited.filter(
      (id) => id != user.userId,
    );

    this.channelSocketStore.addUser(channelId, user.userId);

    return channel;
  }

  readyGame(channel: ChannelDto, userId: number) {
    let readyCount = 0;

    channel.channelPrivate.matcher.map((user) => {
      if (user.userId === userId) user.isReady = !user.isReady;
      if (user.isReady === true) readyCount++;
    });

    if (readyCount === 2) channel.channelPublic.onGame = true;

    return readyCount;
  }

  waitingGame(channel: ChannelDto, userId: number) {
    console.log(channel);
    if (
      channel.channelPrivate.matcher.findIndex(
        (user) => user.userId === userId,
      ) !== -1 ||
      channel.channelPrivate.waiter.indexOf(userId) !== -1
    )
      throw new ForbiddenException();

    if (channel.channelPrivate.matcher.length < 2) {
      channel.channelPrivate.matcher.push({
        userId: userId,
        isReady: false,
      });
    } else {
      channel.channelPrivate.waiter.push(userId);
    }
  }

  leaveGame(channel: ChannelDto, userId: number) {
    channel.channelPrivate.matcher = channel.channelPrivate.matcher.filter(
      (user) => user.userId !== userId,
    );
    channel.channelPrivate.waiter = channel.channelPrivate.waiter.filter(
      (id) => id !== userId,
    );
  }

  // todo: 게임 개발되면서 사용자 나가는 것에 대한 예외처리 해야 함 (ex. 게임 중 나가면 다른 플레이어가 승리하며 게임 종료 된다던지..)
  outChannel(user: UserDto, channel: ChannelDto) {
    const result = {
      userExist: true,
      adminChange: false,
      ownerChange: false,
    };

    if (channel.channelPublic.ownerId === user.userId)
      result.ownerChange = true;
    else if (channel.channelPublic.adminId === user.userId)
      result.adminChange = true;

    // todo: endGame func 만들어야 함
    channel.channelPrivate.matcher = channel.channelPrivate.matcher.filter(
      (matcher) => matcher.userId !== user.userId,
    );

    channel.channelPrivate.waiter = channel.channelPrivate.waiter.filter(
      (id) => id !== user.userId,
    );

    channel.channelPrivate.users = channel.channelPrivate.users.filter(
      (id) => id !== user.userId,
    );

    if (
      !channel.channelPrivate.matcher.length &&
      !channel.channelPrivate.waiter.length &&
      !channel.channelPrivate.users.length
    )
      result.userExist = false;

    if (result.userExist) {
      if (result.ownerChange) this.leaveOwner(channel);
      else if (result.adminChange) this.leaveAdmin(channel);
    }

    return result;
  }

  setAdmin(channel: ChannelDto, userId: number) {
    if (channel.channelPrivate.users.indexOf(userId) === -1)
      throw new BadRequestException();

    channel.channelPublic.adminId = userId;
  }

  leaveOwner(channel: ChannelDto) {
    const ownerId = channel.channelPublic.ownerId;
    const adminId = channel.channelPublic.adminId;

    if (ownerId !== adminId) channel.channelPublic.ownerId = adminId;
    else {
      channel.channelPublic.ownerId = channel.channelPrivate.users[0];
      channel.channelPublic.adminId = channel.channelPublic.ownerId;
    }
  }

  leaveAdmin(channel: ChannelDto) {
    channel.channelPublic.adminId = channel.channelPublic.ownerId;
  }

  inviteUser(channel: ChannelDto, userId: number) {
    channel.channelControl.invited.push(userId);
  }

  kickOutUser(channel: ChannelDto, userId: number) {
    if (channel.channelPrivate.users.indexOf(userId) === -1) {
      throw new BadRequestException();
    }

    channel.channelControl.kickedOutUsers.push(userId);
  }

  mutedUser(channel: ChannelDto, userId: number) {
    const mutedUser: MutedUser = {
      userId: userId,
      expiredAt: Math.floor(new Date().getTime() / 1000) + 300,
    };

    if (channel.channelPrivate.users.indexOf(userId) === -1)
      throw new BadRequestException();

    channel.channelControl.mutedUsers.push(mutedUser);

    return mutedUser;
  }

  async sendDm(sourceId: number, targetId: number) {
    const user = this.userSocketStore.find(targetId);

    if (user.blocks.indexOf(sourceId) !== -1) {
      throw new ForbiddenException();
    }
  }
}
