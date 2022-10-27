import {
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
}

export interface ChannelPublicDto {
  adminId: number;
  ownerId: number;
  channelId: number;
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

export interface ChannelControlDto {
  room: string;
  password?: string;
  kickedOutUsers: number[];
  mutedUsers: MutedUser[];
  invited: number[];
}

export interface GameMatcherInfoDto {
  userId: number;
  score: number;
  pos: number[];
}

export interface GameBallInfoDto {
  speed: number;
  pos: number;
  deltaX: number;
  deltaY: number;
}

export class GameInfoDto {
  gameInterval?: NodeJS.Timer;
  roundInterval?: NodeJS.Timer;
  round: number;
  onRound: boolean;
  pause: boolean;
  matcher: GameMatcherInfoDto[];
  ball: GameBallInfoDto;
}

export class ChannelDto {
  channelPublic: ChannelPublicDto;
  channelPrivate: ChannelPrivateDto;
  channelControl: ChannelControlDto;
  gameInfo: GameInfoDto;
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
  @IsOptional()
  @IsString()
  channelName?: string;

  @IsOptional()
  @IsString()
  accessLayer?: ACCESS_LAYER;

  @IsOptional()
  @IsNumber()
  score?: number;
}
