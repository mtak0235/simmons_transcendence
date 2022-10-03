import { Injectable } from '@nestjs/common';

import {
  ChannelDto,
  ChannelCreateDto,
  ChannelPublicDto,
  GameInfoDto,
  GameMatcherInfoDto,
} from '@socket/dto/channel.socket.dto';
import { EncryptionService } from '@util/encryption.service';

@Injectable()
export class ChannelSocketStore {
  private channelIdx = 0;
  private channels: Map<number, ChannelDto> = new Map();

  constructor(private readonly encryptionService: EncryptionService) {
    this.channels.set(0, {
      channelPublic: {
        channelId: this.channelIdx,
        accessLayer: 'public',
        channelName: '성수와 잼나는 겜 한판 하실 분!!',
        score: 11,
        adminId: 2000,
        ownerId: 2000,
        onGame: false,
      },
      channelPrivate: {
        users: [2000],
        waiter: [],
        matcher: [
          {
            userId: 2000,
            isReady: true,
          },
        ],
      },
      channelControl: {
        password: '123123',
        kickedOutUsers: [],
        mutedUsers: [],
        invited: [],
      },
      gameInfo: this.initialGameSetting(),
    }); // todo: delete: 개발용 코드
  }

  find(channelId: number): ChannelDto {
    return this.channels.get(channelId);
  }

  findAllInfo(): ChannelPublicDto[] {
    return [...this.channels.values()]
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
        password: password,
        kickedOutUsers: [],
        mutedUsers: [],
        invited: [],
      },
      gameInfo: this.initialGameSetting(),
    };

    this.channels.set(this.channelIdx, channel);

    return channel;
  }

  addUser(channelId: number, userId: number) {
    const channel = this.find(channelId);
    channel.channelPrivate.users.push(userId);
  }

  delete(channelId: number) {
    this.channels.delete(channelId);
  }
}
