import { Injectable } from '@nestjs/common';

import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import { ChannelCreateDto, ChannelDto } from '@socket/dto/channel.socket.dto';

@Injectable()
export class ChannelSocketService {
  constructor(private readonly channelSocketStore: ChannelSocketStore) {}

  async createChannel(
    userId: number,
    channelCreateDto: ChannelCreateDto,
  ): Promise<ChannelDto> {
    const channel = await this.channelSocketStore.create(channelCreateDto);

    this.channelSocketStore.addUser(channel.channelInfo.channelKey, userId);

    return channel;
  }
}
