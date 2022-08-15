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
    adminID: string;
}

export interface ChannelInfoDto {
    password?: string;
    channel: ChannelDto;
}

@Injectable()
export class ChannelListStore {
    channels: Record<string, ChannelInfoDto>
}
