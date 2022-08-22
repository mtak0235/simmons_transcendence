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
  channelRoomId: string;
  adminId: number;
  channelName: string;
  accessLayer: ACCESS_LAYER;
  score: number;
}

export interface ChannelDto {
  channelInfo: ChannelInfoDto;
  password?: string;
  users: Array<{
    userId: number;
    username: string;
  }>;
  waiter: Array<number>;
  kickedOutUsers: Array<number>;
  mutedUsers: Array<MutedUser>;
  matcher: Array<Matcher>;
  onGame: boolean;
}

export interface ChannelCreateDto {
  adminId: number;
  channelName: string;
  password?: string;
  accessLayer: ACCESS_LAYER;
  score: number;
}

export interface ChannelUpdateDto {
  adminId?: number;
  channelName?: string;
  password?: string;
  accessLayer?: ACCESS_LAYER;
  score?: number;
}
