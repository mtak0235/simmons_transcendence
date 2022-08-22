export const STATUS_LAYER = {
  inGame: 'inGame',
  online: 'online',
  offline: 'offline',
} as const;

export type STATUS_LAYER = typeof STATUS_LAYER[keyof typeof STATUS_LAYER];

export interface UserDto extends UserInfoDto {
  follows: Array<number>;
  blocks: Array<number>;
}

export interface UserInfoDto {
  userId: number;
  username: string;
  status: STATUS_LAYER;
}

export interface UserUpdateDto {
  username?: string;
  status?: STATUS_LAYER;
  follows?: Array<number>;
  blocks?: Array<number>;
}
