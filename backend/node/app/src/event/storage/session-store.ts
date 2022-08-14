import { Message } from '@src/event/storage/message-store';

export interface Session {
  userName: string;
  connected: boolean;
  message: Message;
}
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
