import { Message } from '@src/event/storage/message-store';
import { Injectable } from '@nestjs/common';

export interface Session {
  userID: string;
  userName: string;
  connected: boolean;
  message?: Message;
}
@Injectable()
export class SessionStore {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map();
  }

  findSession(id) {
    return this.sessions.get(id);
  }

  saveSession(id, session) {
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }
}
