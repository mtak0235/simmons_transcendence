import { Injectable, Logger } from '@nestjs/common';

import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import {
  ACCESS_LAYER,
  ChannelCreateDto,
  ChannelDto,
  MutedUser,
} from '@socket/dto/channel.socket.dto';
import { SocketInstance } from '@socket/socket.gateway';
import { Server } from 'socket.io';
import GameLogRepository from '@repository/game.log.repository';
import { UserSocketStore } from '@socket/storage/user.socket.store';
@Injectable()
export class ChannelSocketService {
  constructor(
    private readonly channelSocketStore: ChannelSocketStore,
    private gameLogRepository: GameLogRepository,
    private userSocketStore: UserSocketStore,
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

  async sendDM(client: SocketInstance, targetId: number, msg: string) {
    const targetUser = this.userSocketStore.find(targetId);
    if (this.userSocketStore.isBlocking(targetUser, client.user.userId)) {
      return;
    }
    client.to(`room:user:${targetId}`).emit('channel:getDM', {
      userID: client.user.userId,
      userName: client.user.username,
      msg,
    });
  }

  async sendMSG(client: SocketInstance, msg: string, server: Server) {
    let channelName = this.getChannelFullName(
      client.rooms,
      /^room:channel:/,
    ).at(0);
    //todo rm
    channelName = 'room:channel:0';
    const channelDto = this.channelSocketStore.find(channelName);
    //todo rm
    const date1 = new Date();
    date1.setMinutes(date1.getMinutes() - 3);
    channelDto.mutedUsers.push({
      userId: client.user.userId,
      expiredAt: date1,
    });
    console.log(channelDto);
    const mutedUser: MutedUser = channelDto.mutedUsers
      .filter((value) => value.userId == client.user.userId)
      .at(0);
    console.log(
      'muted time: ' +
        (new Date().getTime() - mutedUser.expiredAt.getTime()) / 60000,
    );
    if (
      (new Date().getTime() - mutedUser.expiredAt.getTime()) / 60000 < 5 &&
      mutedUser
    ) {
      return;
    }
    client
      .to(this.getChannelFullName(client.rooms, /^room:channel:/))
      .emit('channel:getMSG', {
        userID: client.user.userId,
        userName: client.user.username,
        msg,
      });
  }

  async endGame(client: SocketInstance, server: Server, result) {
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

  readyGame(client: SocketInstance, server: Server) {
    const channelName = this.getChannelFullName(
      client.rooms,
      /^room:channel:/,
    ).at(0);
    //todo channelName
    const channelDto: ChannelDto = this.channelSocketStore.find(channelName);
    channelDto.matcher
      .filter((val) => val.userId === client.user.userId)
      .at(0).isReady = true;
    if (channelDto.matcher.filter((value) => value.isReady == false).length) {
      server.in(channelName).emit('channel:readyGame', client.user.userId);
    }
    server.in(channelName).emit('channel:startGame', {
      waiter: channelDto.waiter,
      matcher: channelDto.matcher,
      score: channelDto.channelInfo.score,
    });
  }

  waitingGame(client: SocketInstance, server: Server) {
    const channelName = this.getChannelFullName(
      client.rooms,
      /^room:channel:/,
    ).at(0);
    const channelDto = this.channelSocketStore.find(channelName);
    channelDto.waiter.push(client.user.userId);
    if (channelDto.waiter.length < 2) {
      server
        .to(channelName)
        .emit('channel:readyGame', { waiter: client.user.userId });
      return;
    }
    for (let i = 0; i < 2; i++) {
      channelDto.matcher.push({
        isReady: false,
        userId: channelDto.waiter.shift(),
      });
    }
  }
}
