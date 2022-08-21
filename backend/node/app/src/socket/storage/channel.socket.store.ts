import { Injectable } from '@nestjs/common';

import {
  ChannelDto,
  ChannelCreateDto,
  ChannelInfoDto,
} from '@socket/dto/channel.socket.dto';
import { EncryptionService } from '@util/encryption.service';

@Injectable()
export class ChannelSocketStore {
  private channelIdx = 0;
  private channels: Map<string, ChannelDto> = new Map();

  constructor(private readonly encryptionService: EncryptionService) {}

  find(channelName: string): ChannelDto {
    return this.channels.get(channelName);
  }

  findAllInfo(): ChannelInfoDto[] {
    this.channels.set('room:channel:1', {
      channelIdx: this.channelIdx,
      password: '123123',
      channelInfo: {
        channelId: 'room:channel:1',
        accessLayer: 'public',
        channelName: '성수와 잼나는 겜 한판 하실 분!!',
        score: 11,
        adminId: 2269,
      },
      waiter: [],
      kickedOutUsers: [],
      mutedUsers: [],
      matcher: [],
      onGame: false,
    }); // todo: delete: 개발용 코드

    return [...this.channels.values()].map(
      (channel: ChannelDto): ChannelInfoDto => channel.channelInfo,
    );
  }

  async create(channelCreateDto: ChannelCreateDto): Promise<ChannelDto> {
    this.channelIdx++;

    const channelKey = `room:channel:${this.channelIdx}`;
    const password = channelCreateDto.password
      ? await this.encryptionService.hash(channelCreateDto.password)
      : undefined;

    const channel: ChannelDto = {
      channelIdx: this.channelIdx,
      password: password,
      channelInfo: {
        channelId: channelKey,
        accessLayer: channelCreateDto.accessLayer,
        channelName: channelCreateDto.channelName,
        score: channelCreateDto.score,
        adminId: channelCreateDto.adminId,
      },
      waiter: [],
      kickedOutUsers: [],
      mutedUsers: [],
      matcher: [],
      onGame: false,
    };

    this.channels[channelKey] = channel;

    return channel;
  }
}
