import { Message } from '@src/event/storage/message-store';
import { Injectable } from '@nestjs/common';

export const STATUS_LAYER = {
  inGame: 'inGame',
  online: 'online',
  offline: 'offline',
} as const;

export type STATUS_LAYER = typeof STATUS_LAYER[keyof typeof STATUS_LAYER];
export interface User {
  userID: number;
  userName: string;
  status: STATUS_LAYER;
  // message?: Message;
  friends: Array<number>;
  blocks: Array<number>;
}
@Injectable()
export class UserStore {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  findSession(id) {
    return this.users.get(id);
  }

  saveSession(id, session) {
    this.users.set(id, session);
  }

  findAllSessions() {
    return [...this.users.values()];
  }
}
