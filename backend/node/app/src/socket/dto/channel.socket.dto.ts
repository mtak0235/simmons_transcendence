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
  //todo: 여기에  score가 왜있지?
  // score: number;
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

export interface GameMatcherInfoDto {
  userId: number;
  score: number;
  pos: number[];
}

export class GameInfoDto {
  round: number;
  onRound: boolean;
  pause: boolean;
  ballSpeed: number;
  matcher: GameMatcherInfoDto[];
  deltaX: number;
  deltaY: number;
}

export class ChannelDto {
  channelPublic: ChannelPublicDto;
  channelPrivate: ChannelPrivateDto;
  gameInfo: GameInfoDto;
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
