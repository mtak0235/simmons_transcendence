import { Message } from './in-memory-message-store';

export interface Session {
  userID: string;
  userName: string;
  connected: boolean;
  message: Message;
}
export class InMemorySessionStore {
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
