import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export const ACCESS_LAYER = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PROTECTED: 'protected',
} as const;

export type ACCESS_LAYER = typeof ACCESS_LAYER[keyof typeof ACCESS_LAYER];

export interface MutedUser {
  userId: number;
  expiredAt: number;
}

export interface Matcher {
  userId: number;
  isReady: boolean;
  score: number;
}

export interface ChannelInfoDto {
  channelIdx: number;
  channelKey: string;
  adminId: number;
  channelName: string;
  accessLayer: ACCESS_LAYER;
  score: number;
}

export interface ChannelDto {
  channelInfo: ChannelInfoDto;
  password?: string;
  users: number[];
  waiter: number[];
  kickedOutUsers: number[];
  mutedUsers: MutedUser[];
  matcher: Matcher[];
  invited: number[];
  onGame: boolean;
}

export class ChannelCreateDto {
  @IsNotEmpty()
  adminId: number;

  @IsNotEmpty()
  channelName: string;

  password?: string;

  @IsNotEmpty()
  @IsString()
  accessLayer: ACCESS_LAYER;

  @IsNotEmpty()
  score: number;
}

export interface ChannelUpdateDto {
  adminId?: number;
  channelName?: string;
  password?: string;
  accessLayer?: ACCESS_LAYER;
  score?: number;
}
