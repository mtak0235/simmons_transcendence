// todo: Domain으로 뺄 코드들 들어있는 공간임

export const STATUS_LAYER = {
  inGame: "inGame",
  waitingGame: "waitingGame",
  watchingGame: "watchingGame",
  online: "online",
  offline: "offline",
} as const;

export type STATUS_LAYER = typeof STATUS_LAYER[keyof typeof STATUS_LAYER];

export interface UserInfoDto {
  userId: number;
  username: string;
  status: STATUS_LAYER;
}

export interface UserDto extends UserInfoDto {
  follows: Array<number>;
  blocks: Array<number>;
}

export const ACCESS_LAYER = {
  PUBLIC: "public",
  PRIVATE: "private",
  PROTECTED: "protected",
} as const;

export type ACCESS_LAYER = typeof ACCESS_LAYER[keyof typeof ACCESS_LAYER];

export interface MutedUser {
  userId: number;
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

export interface ChannelDto {
  channelPublic: ChannelPublicDto;
  channelPrivate: ChannelPrivateDto;
  kickedOutUsers: number[];
  mutedUsers: MutedUser[];
  invited: number[];
}

export interface MainPageDto {
  me: UserDto;
  users: UserInfoDto[];
  channels: ChannelPublicDto[];
}

export interface SocketErrorDto {
  error: string;
  message: string;
}
