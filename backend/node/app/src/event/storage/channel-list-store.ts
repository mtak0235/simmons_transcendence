import { Injectable } from '@nestjs/common';

export const ACCESS_LAYER = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PROTECTED: 'protected',
} as const;

export type ACCESS_LAYER = typeof ACCESS_LAYER[keyof typeof ACCESS_LAYER];

export interface ChannelDto {
  accessLayer: ACCESS_LAYER;
  channelName: string;
  score: number;
  adminID: number;
}

export interface ChannelInfoDto {
  password?: string;
  channel: ChannelDto;
}

@Injectable()
export class ChannelListStore {
  private channels: Record<string, ChannelInfoDto>;

  findChannel(channelName: string) {
    return this.channels[channelName];
  }

  createChannel(key: string, channelInfoDto: ChannelInfoDto) {
    this.channels[key] = {
      password: channelInfoDto.password,
      channel: channelInfoDto.channel,
    };
    return channelInfoDto.channel;
  }
}
