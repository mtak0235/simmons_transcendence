import {
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export const ACCESS_LAYER = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PROTECTED: 'protected',
} as const;

export type ACCESS_LAYER = typeof ACCESS_LAYER[keyof typeof ACCESS_LAYER];

export class MutedUser {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
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
  @IsNumber()
  adminId: number;

  @IsNotEmpty()
  @IsString()
  channelName: string;

  password?: string;

  @IsNotEmpty()
  @IsString()
  accessLayer: ACCESS_LAYER;

  @IsNotEmpty()
  @IsNumber()
  score: number;
}

export class ChannelUpdateDto {
  @IsEmpty()
  @IsString()
  channelName?: string;

  @IsEmpty()
  @IsString()
  password?: string;

  @IsEmpty()
  @IsString()
  accessLayer?: ACCESS_LAYER;

  @IsEmpty()
  @IsNumber()
  score?: number;
}
