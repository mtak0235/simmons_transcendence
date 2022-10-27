import { Injectable } from '@nestjs/common';

import {
  ChannelDto,
  ChannelCreateDto,
  ChannelPublicDto,
  GameInfoDto,
  GameMatcherInfoDto,
} from '@socket/dto/channel.socket.dto';
import { EncryptionService } from '@util/encryption.service';
import BaseSocketStore from '@socket/storage/base.socket.store';

@Injectable()
export class ChannelSocketStore extends BaseSocketStore<ChannelDto> {
  private channelIdx = 0;

  constructor(private readonly encryptionService: EncryptionService) {
    super();
  }

  findAllInfo(): ChannelPublicDto[] {
    return [...this.values()]
      .map((channel: ChannelDto): ChannelPublicDto => {
        if (channel.channelPublic.accessLayer !== 'private')
          return channel.channelPublic;
      })
      .filter((channel) => channel);
  }

  initialGameSetting(): GameInfoDto {
    return {
      round: 0,
      onRound: false,
      pause: false,
      ball: {
        pos: Math.round((10 * 20) / 2) + 10,
        speed: 200,
        deltaX: -1,
        deltaY: -20,
      },
      matcher: new Array<GameMatcherInfoDto>(2),
    };
  }

  async create(channelCreateDto: ChannelCreateDto): Promise<ChannelDto> {
    this.channelIdx++;

    // todo: protected인 경우만 들어와야 함
    const password = channelCreateDto.password
      ? await this.encryptionService.hash(channelCreateDto.password)
      : undefined;

    const channel: ChannelDto = {
      channelPublic: {
        channelId: this.channelIdx,
        accessLayer: channelCreateDto.accessLayer,
        channelName: channelCreateDto.channelName,
        score: channelCreateDto.score,
        adminId: channelCreateDto.ownerId,
        ownerId: channelCreateDto.ownerId,
        onGame: false,
      },
      channelPrivate: {
        users: [channelCreateDto.ownerId],
        waiter: [],
        matcher: [],
      },
      channelControl: {
        room: `room:channel:${this.channelIdx}`,
        password: password,
        kickedOutUsers: [],
        mutedUsers: [],
        invited: [],
      },
      gameInfo: this.initialGameSetting(),
    };

    this.set(this.channelIdx, channel);

    return channel;
  }

  addUser(channelId: number, userId: number) {
    const channel = this.get(channelId);
    channel.channelPrivate.users.push(userId);
  }
}
