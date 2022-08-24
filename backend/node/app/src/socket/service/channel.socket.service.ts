import { Injectable } from '@nestjs/common';

import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import { ChannelCreateDto, ChannelDto } from '@socket/dto/channel.socket.dto';
import { SocketInstance } from '@socket/socket.gateway';
import { Server } from 'socket.io';

@Injectable()
export class ChannelSocketService {
  constructor(private readonly channelSocketStore: ChannelSocketStore) {}

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

  sendDM(client: SocketInstance, targetId: string, msg: string) {
    client.to(`room:user:${targetId}`).emit('getDM', {
      userID: client.user.userId,
      userName: client.user.username,
      msg,
    });
  }

  sendMSG(client: SocketInstance, msg: string) {
    client
      .to(this.getChannelFullName(client.rooms, /^room:channel:/))
      .emit('getMSG', {
        userID: client.user.userId,
        userName: client.user.username,
        msg,
      });
  }

  endGame(client: SocketInstance, server: Server) {
    const channelName = this.getChannelFullName(client.rooms, /^room:user:/).at(
      0,
    );
    const channelDto = this.channelSocketStore.find(channelName);
    if (
      Array.from(channelDto.matcher.values()).filter((isReady) => !isReady)
        .length
    ) {
      server.in(channelName).emit('readyGame', client.user.userId);
    } else {
      server.in(channelName).emit('startGame');
    }
  }

  readyGame(client: SocketInstance, server: Server) {
    const channelName = this.getChannelFullName(client.rooms, /^room:user:/).at(
      0,
    );
    const channelDto: ChannelDto = this.channelSocketStore.find(channelName);
    if (channelDto.matcher.filter((value) => value.isReady == false).length) {
      server.in(channelName).emit('readyGame', client.user.userId);
    }
    server.in(channelName).emit('startGame', {
      waiter: channelDto.waiter,
      matcher: channelDto.matcher,
      score: channelDto.channelInfo.score,
    });
  }

  waitingGame(client: SocketInstance) {
    const channelName = this.getChannelFullName(client.rooms, /^room:user:/).at(
      0,
    );
    const channelDto = this.channelSocketStore.find(channelName);
    channelDto.waiter.push(client.user.userId);
    if (channelDto.waiter.length < 2) {
      client.to(channelName).emit('readyGame', { waiter: client.user.userId });
      return;
    }
    for (let i = 0; i < 2; i++) {
      channelDto.matcher.push({
        isReady: false,
        score: channelDto.channelInfo.score,
        userId: channelDto.waiter.shift(),
      });
    }
  }
}
