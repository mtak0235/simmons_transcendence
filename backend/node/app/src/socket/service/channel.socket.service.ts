import { Injectable, Logger } from '@nestjs/common';

import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import {
  ACCESS_LAYER,
  ChannelCreateDto,
  ChannelDto,
  Matcher,
} from '@socket/dto/channel.socket.dto';
import { ClientInstance } from '@socket/socket.gateway';
import { Server } from 'socket.io';
import GameLogRepository from '@repository/game.log.repository';
import { channel } from 'diagnostics_channel';

@Injectable()
export class ChannelSocketService {
  constructor(
    private readonly channelSocketStore: ChannelSocketStore,
    private gameLogRepository: GameLogRepository,
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
    userId: number,
    channelCreateDto: ChannelCreateDto,
  ): Promise<ChannelDto> {
    const channel = await this.channelSocketStore.create(channelCreateDto);

    this.channelSocketStore.addUser(channel.channelInfo.channelKey, userId);

    return channel;
  }

  sendDM(client: ClientInstance, targetId: string, msg: string) {
    client.to(`room:user:${targetId}`).emit('getDM', {
      userID: client.user.userId,
      userName: client.user.username,
      msg,
    });
  }

  // sendMSG(client: SocketInstance, msg: string) {
  //   const channelName = this.getChannelFullName(client.rooms, /^room:user:/).at(
  //     0,
  //   );
  //   const channelDto = this.channelSocketStore.find(channelName);
  //   client
  //     .to(this.getChannelFullName(client.rooms, /^room:channel:/))
  //     .emit('channel:getMSG', {
  //       userID: client.user.userId,
  //       userName: client.user.username,
  //       msg,
  //     });
  // }
  async endGame(server: Server, result) {
    const channelName = this.getChannelFullName(
      client.rooms,
      /^room:channel:/,
    ).at(0);
    const channelDto = this.channelSocketStore.find(channelName);
    channelDto.onGame = false;
    const logs = this.gameLogRepository.create({
      playerAId: channelDto.matcher.at(0).userId,
      playerBId: channelDto.matcher.at(1).userId,
      result,
    });
    channelDto.matcher = [];
    if (channelDto.waiter.length >= 2) {
      for (let i = 0; i < 2; i++) {
        channelDto.matcher.push({
          isReady: false,
          userId: channelDto.waiter.shift(),
        });
      }
    }
    await this.gameLogRepository.save(logs);
    server.in(channelName).emit('gameOver', {
      waiter: channelDto.waiter,
      matcher: channelDto.matcher,
    });
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
  }
}
