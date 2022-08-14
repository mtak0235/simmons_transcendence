import { Injectable } from '@nestjs/common';
import { Session, SessionStore } from '@src/event/storage/session-store';

@Injectable()
export class EventService {
  constructor(private sessionStore: SessionStore) {}
  getUserID(encryptedUserID: string) {
    // encryptedUserID => userID 빼는 로직
    return encryptedUserID;
  }

  findSession(userID: string): Session {
    return this.sessionStore.findSession(userID);
  }

  getUserName(userID: string): string {
    // db에서 userName 가져와야됨.
    return userID + 'NAME';
  }

  saveSession(userID: string, session: Session) {
    this.sessionStore.saveSession(userID, session);
  }
  getBlockList(userID: any): {
    return;
  };
}
