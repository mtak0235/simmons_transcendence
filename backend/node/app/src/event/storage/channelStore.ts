import { Injectable } from '@nestjs/common';

export const ACCESS_LAYER = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PROTECTED: 'protected',
} as const;

export type ACCESS_LAYER = typeof ACCESS_LAYER[keyof typeof ACCESS_LAYER];

export interface ChannelDisplayableDto {
  accessLayer: ACCESS_LAYER;
  channelName: string;
  score: number;
  adminID: number;
}

export interface MutedUser {
  expiredDate: number;
  userID: number;
}

export interface Matcher extends Waiter {
  isReady: boolean;
  score: number;
}

export interface Waiter {
  userId: number;
  userName: string;
}
// export interface Game {}
export interface ChannelInfoDto {
  password?: string; // todo: bcrypt
  channel: ChannelDisplayableDto;
  waiter: Array<Waiter>;
  kickedOutUsers: Array<number>;
  mutedUsers: Array<MutedUser>;
  matcher: Array<Matcher>;
  onGame: boolean;
}

@Injectable()
export class ChannelStore {
  private channels: Record<string, ChannelInfoDto>;

  findChannel(channelName: string) {
    return this.channels[channelName];
  }

  createChannel(key: string, channelInfoDto: ChannelInfoDto) {
    this.channels[key] = {
      matcher: undefined,
      waiter: [],
      password: channelInfoDto.password,
      channel: channelInfoDto.channel,
    };
    return channelInfoDto.channel;
  }
}
