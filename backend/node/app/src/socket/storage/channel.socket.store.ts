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
  private channels: Map<number, ChannelDto> = new Map();

  constructor(private readonly encryptionService: EncryptionService) {
    this.channels.set(0, {
      channelInfo: {
        channelIdx: this.channelIdx,
        accessLayer: 'public',
        channelName: '성수와 잼나는 겜 한판 하실 분!!',
        score: 11,
        adminId: 2000,
      },
      password: '123123',
      users: [],
      waiter: [],
      kickedOutUsers: [],
      mutedUsers: [],
      matcher: [],
      invited: [],
      onGame: false,
    }); // todo: delete: 개발용 코드
  }

  find(channelId: number): ChannelDto {
    return this.channels.get(channelId);
  }

  findAllInfo(): ChannelInfoDto[] {
    return [...this.channels.values()]
      .map((channel: ChannelDto): ChannelInfoDto => {
        if (channel.channelInfo.accessLayer !== 'private')
          return channel.channelInfo;
      })
      .filter((channel) => channel);
  }

  async create(channelCreateDto: ChannelCreateDto): Promise<ChannelDto> {
    this.channelIdx++;

    const channelKey = this.channelIdx;

    const password = channelCreateDto.password
      ? await this.encryptionService.hash(channelCreateDto.password)
      : undefined;

    const channel: ChannelDto = {
      channelInfo: {
        channelIdx: this.channelIdx,
        accessLayer: channelCreateDto.accessLayer,
        channelName: channelCreateDto.channelName,
        score: channelCreateDto.score,
        adminId: channelCreateDto.adminId,
      },
      password: password,
      users: [],
      waiter: [],
      kickedOutUsers: [],
      mutedUsers: [],
      matcher: [],
      invited: [],
      onGame: false,
    };

    this.channels.set(this.channelIdx, channel);

    return channel;
  }

  addUser(channelId: number, userId: number) {
    const channel = this.find(channelId);
    channel.users.push(userId);
  }

  delete(channelId: number) {
    this.channels.delete(channelId);
  }
}
