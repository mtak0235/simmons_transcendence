import { Injectable, UsePipes, ValidationPipe } from '@nestjs/common';

import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import { ChannelCreateDto, ChannelDto } from '@socket/dto/channel.socket.dto';

@Injectable()
export class ChannelSocketService {
  constructor(private readonly channelSocketStore: ChannelSocketStore) {}

  async createChannel(channelCreateDto: ChannelCreateDto): Promise<ChannelDto> {
    return await this.channelSocketStore.create(channelCreateDto);
  }
}
