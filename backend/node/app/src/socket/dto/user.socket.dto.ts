export const STATUS_LAYER = {
  inGame: 'inGame',
  waitingGame: 'waitingGame',
  watchingGame: 'watchingGame',
  online: 'online',
  offline: 'offline',
} as const;

export type STATUS_LAYER = typeof STATUS_LAYER[keyof typeof STATUS_LAYER];

export class UserInfoDto {
  userId: number;
  username: string;
  status: STATUS_LAYER;
}

export class UserDto extends UserInfoDto {
  follows: Array<number>;
  blocks: Array<number>;
}

export interface UserUpdateDto {
  username?: string;
  status?: STATUS_LAYER;
  follows?: Array<number>;
  blocks?: Array<number>;
}
