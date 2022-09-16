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
  //todo: 여기에  score가 왜있지?
  // score: number;
}

export interface ChannelPublicDto {
  adminId: number;
  ownerId: number;
  channelIdx: number;
  accessLayer: ACCESS_LAYER;
  channelName: string;
  score: number;
  onGame: boolean;
}

export interface ChannelPrivateDto {
  users: number[];
  waiter: number[];
  matcher: Matcher[];
}

export class ChannelDto {
  channelPublic: ChannelPublicDto;
  channelPrivate: ChannelPrivateDto;
  password?: string;
  kickedOutUsers: number[];
  mutedUsers: MutedUser[];
  invited: number[];
}

export class ChannelCreateDto {
  @IsNotEmpty()
  @IsNumber()
  ownerId: number;

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
