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
import { SocketInstance } from '@socket/socket.gateway';
import { Server } from 'socket.io';
import GameLogRepository from '@repository/game.log.repository';
import { UserDto } from '@socket/dto/user.socket.dto';
import { UserSocketService } from '@socket/service/user.socket.service';
import { EncryptionService } from '@util/encryption.service';

@Injectable()
export class ChannelSocketService {
  constructor(
    private readonly channelSocketStore: ChannelSocketStore,
    private readonly gameLogRepository: GameLogRepository,
    private readonly userSocketService: UserSocketService,
    private readonly encryptionService: EncryptionService,
  ) {}
  getChannelFullName(rooms: Set<string>, roomNamePrefix: RegExp) {
    const ret = new Array<string>();
    for (const room of rooms) {
      if (roomNamePrefix.test(room)) {
        ret.push(room);
      }
    }
    return ret;
  }

  async createChannel(
    user: UserDto,
    channelCreateDto: ChannelCreateDto,
  ): Promise<ChannelDto> {
    const channel = await this.channelSocketStore.create(channelCreateDto);

    this.channelSocketStore.addUser(
      channel.channelInfo.channelIdx,
      user.userId,
    );

    this.userSocketService.switchStatus(user, 'waitingGame');

    return channel;
  }

  updateChannel(channel: ChannelDto, channelUpdateDto: ChannelUpdateDto) {
    for (const key in channelUpdateDto)
      channel.channelInfo[key] = channelUpdateDto[key];
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
        ((channel.channelInfo.accessLayer === 'protected' &&
          !(await this.encryptionService.compare(
            password,
            channel.password,
          ))) ||
          channel.channelInfo.accessLayer === 'private')) ||
      channel.kickedOutUsers.indexOf(user.userId)
    )
      throw new ForbiddenException();

    channel.invited = channel.invited.filter((id) => id != user.userId);

    channel.users.push(user.userId);

    return channel;
  }

  async endGame(channel: ChannelDto, result: number) {
    channel.onGame = false;
    const logs = this.gameLogRepository.create({
      playerAId: channel.matcher.at(0).userId,
      playerBId: channel.matcher.at(1).userId,
      result,
    });
    channel.matcher = [];
    if (channel.waiter.length >= 2) {
      for (let i = 0; i < 2; i++) {
        channel.matcher.push({
          isReady: false,
          userId: channel.waiter.shift(),
        });
      }
    }
    await this.gameLogRepository.save(logs);
  }

  readyGame(matcher: Matcher[], userId: number) {
    matcher.filter((val) => val.userId === userId).at(0).isReady = true;
  }

  waitingGame(channelDto: ChannelDto, userId) {
    channelDto.waiter.push(userId);
    if (channelDto.waiter.length >= 2) {
      for (let i = 0; i < 2; i++) {
        channelDto.matcher.push({
          isReady: false,
          userId: channelDto.waiter.shift(),
        });
      }
    }

  outChannel(user: UserDto, channel: ChannelDto) {
    const result = {
      userExist: true,
      adminChange: false,
    };

    if (channel.channelInfo.adminId === user.userId) {
      channel.channelInfo.adminId = channel.users[1];
      result.adminChange = true;
    }

    if (user.status === 'inGame')
      channel.matcher = channel.matcher.filter(
        (matcher) => matcher.userId !== user.userId,
      );
    else if (user.status === 'waitingGame')
      channel.waiter = channel.waiter.filter((id) => id !== user.userId);
    channel.users = channel.users.filter((id) => id !== user.userId);

    if (channel.users.length === 0) result.userExist = false;

    return result;
  }

  inviteUser(channel: ChannelDto, userId: number) {
    channel.invited.push(userId);
  }

  kickOutUser(channel: ChannelDto, userId: number) {
    channel.kickedOutUsers.push(userId);
  }

  mutedUser(channel: ChannelDto, mutedUser: MutedUser) {
    channel.mutedUsers.push(mutedUser);
  }
}
