export const STATUS_LAYER = {
  inGame: 'inGame',
  waitingGame: 'waitingGame',
  inChannel: 'inChannel',
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
  follows: Array<number>; //username 정보도 들어가야 함.
  blocks: Array<number>;
  room: string;
}

export interface UserUpdateDto {
  username?: string;
  status?: STATUS_LAYER;
  follows?: Array<number>;
  blocks?: Array<number>;
}
