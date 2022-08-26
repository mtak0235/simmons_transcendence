import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import { ChannelCreateDto, ChannelDto } from '@socket/dto/channel.socket.dto';
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

  async inChannel(
    user: UserDto,
    channelId: number,
    password?: string,
  ): Promise<ChannelDto> {
    const channel: ChannelDto = this.channelSocketStore.find(channelId);

    if (!channel) throw new NotFoundException();

    if (
      !channel.invited.indexOf(user.userId) &&
      ((channel.channelInfo.accessLayer === 'protected' &&
        !(await this.encryptionService.compare(password, channel.password))) ||
        channel.channelInfo.accessLayer === 'private')
    )
      throw new ForbiddenException();

    channel.invited = channel.invited.filter((id) => id != user.userId);

    channel.users.push(user.userId);

    return channel;
  }

  outChannel(user: UserDto, channel: ChannelDto): boolean {
    if (!channel) throw new NotFoundException();

    if (channel.channelInfo.adminId === user.userId)
      channel.channelInfo.adminId = channel.users[1];

    if (user.status === 'inGame')
      channel.matcher = channel.matcher.filter(
        (matcher) => matcher.userId !== user.userId,
      );
    else if (user.status === 'waitingGame')
      channel.waiter = channel.waiter.filter((id) => id !== user.userId);
    channel.users = channel.users.filter((id) => id !== user.userId);

    return channel.users.length > 0;
  }

  inviteUser(channel: ChannelDto, userId: number) {
    if (!channel) throw new BadRequestException();

    channel.invited.push(userId);
  }

  sendDM(client: SocketInstance, targetId: string, msg: string) {
    // client.to(`room:user:${targetId}`).emit('getDM', {
    //   userID: client.user.userId,
    //   userName: client.user.username,
    //   msg,
    // });
  }

  sendMSG(client: SocketInstance, msg: string) {
    // const channelName = this.getChannelFullName(client.rooms, /^room:user:/).at(
    //   0,
    // );
    // const channelDto = this.channelSocketStore.find(channelName);
    //
    // client
    //   .to(this.getChannelFullName(client.rooms, /^room:channel:/))
    //   .emit('channel:getMSG', {
    //     userID: client.user.userId,
    //     userName: client.user.username,
    //     msg,
    //   });
  }

  endGame(client: SocketInstance, server: Server) {
    // const channelName = this.getChannelFullName(client.rooms, /^room:user:/).at(
    //   0,
    // );
    // const channelDto = this.channelSocketStore.find(channelName);
    // channelDto.onGame = false;
    // this.gameLogRepository.create();
  }

  readyGame(client: SocketInstance, server: Server) {
    // const channelName = this.getChannelFullName(client.rooms, /^room:user:/).at(
    //   0,
    // );
    // const channelDto: ChannelDto = this.channelSocketStore.find(channelName);
    // if (channelDto.matcher.filter((value) => value.isReady == false).length) {
    //   server.in(channelName).emit('channel:readyGame', client.user.userId);
    // }
    // server.in(channelName).emit('channel:startGame', {
    //   waiter: channelDto.waiter,
    //   matcher: channelDto.matcher,
    //   score: channelDto.channelInfo.score,
    // });
  }

  waitingGame(client: SocketInstance) {
    //   const channelName = this.getChannelFullName(client.rooms, /^room:user:/).at(
    //     0,
    //   );
    //   const channelDto = this.channelSocketStore.find(channelName);
    //   channelDto.waiter.push(client.user.userId);
    //   if (channelDto.waiter.length < 2) {
    //     client
    //       .to(channelName)
    //       .emit('channel:readyGame', { waiter: client.user.userId });
    //     return;
    //   }
    //   for (let i = 0; i < 2; i++) {
    //     channelDto.matcher.push({
    //       isReady: false,
    //       score: channelDto.channelInfo.score,
    //       userId: channelDto.waiter.shift(),
    //     });
    //   }
  }
}
