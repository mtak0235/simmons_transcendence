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
    const channel = await this.channelSocketStore.create(channelCreateDto);

    this.channelSocketStore.addUser(
      channel.channelPublic.channelIdx,
      user.userId,
    );

    this.userSocketService.switchStatus(user, 'waitingGame');

    return channel;
  }

  updateChannel(channel: ChannelDto, channelUpdateDto: ChannelUpdateDto) {
    for (const key in channelUpdateDto)
      channel.channelPublic[key] = channelUpdateDto[key];
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

    // todo: if문 최적화, interceptor 로 뺴도 될듯
    if (
      (!channel.invited.indexOf(user.userId) &&
        ((channel.channelPublic.accessLayer === 'protected' &&
          !(await this.encryptionService.compare(
            password,
            channel.password,
          ))) ||
          channel.channelPublic.accessLayer === 'private')) ||
      channel.kickedOutUsers.indexOf(user.userId)
    )
      throw new ForbiddenException();

    channel.invited = channel.invited.filter((id) => id != user.userId);

    this.channelSocketStore.addUser(channelId, user.userId);

    return channel;
  }

  async endGame(channel: ChannelDto, result: number) {
    channel.channelPublic.onGame = false;
    const logs = this.gameLogRepository.create({
      playerAId: channel.channelPrivate.matcher.at(0).userId,
      playerBId: channel.channelPrivate.matcher.at(1).userId,
      result,
    });
    channel.channelPrivate.matcher = [];
    if (channel.channelPrivate.waiter.length >= 2) {
      for (let i = 0; i < 2; i++) {
        channel.channelPrivate.matcher.push({
          isReady: false,
          userId: channel.channelPrivate.waiter.shift(),
        });
      }
    }
    await this.gameLogRepository.save(logs);
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

  waitingGame(channel: ChannelDto, userId) {
    if (channel.channelPrivate.matcher.length < 2)
      channel.channelPrivate.matcher.push({
        userId: userId,
        isReady: false,
      });
    else {
      channel.channelPrivate.waiter.push(userId);
    }
  }

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

    if (user.status === 'inGame') {
      // todo: endGame func 만들어야 함
      channel.channelPrivate.matcher = channel.channelPrivate.matcher.filter(
        (matcher) => matcher.userId !== user.userId,
      );
    } else if (user.status === 'waitingGame')
      channel.channelPrivate.waiter = channel.channelPrivate.waiter.filter(
        (id) => id !== user.userId,
      );

    channel.channelPrivate.users = channel.channelPrivate.users.filter(
      (id) => id !== user.userId,
    );

    if (channel.channelPrivate.users.length === 0) result.userExist = false;

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
    channel.invited.push(userId);
  }

  kickOutUser(channel: ChannelDto, userId: number) {
    if (channel.channelPrivate.users.indexOf(userId) === -1) {
      throw new BadRequestException();
    }

    channel.kickedOutUsers.push(userId);
  }

  mutedUser(channel: ChannelDto, mutedUser: MutedUser) {
    if (channel.channelPrivate.users.indexOf(mutedUser.userId) === -1) {
      throw new BadRequestException();
    }

    channel.mutedUsers.push(mutedUser);
  }

  async sendDm(sourceId: number, targetId: number) {
    const user = this.userSocketStore.find(targetId);

    if (user.blocks.indexOf(sourceId) !== -1) {
      throw new ForbiddenException();
    }
  }
}
