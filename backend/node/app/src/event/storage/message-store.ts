import { Injectable } from '@nestjs/common';

export interface Message {
  msg: string;
  from: string;
  to: string;
}
@Injectable()
export class MessageStore {
  private messages: Array<Message>;

  saveMessage(message) {
    this.messages.push(message);
  }

  findMessagesForUser(userID: string) {
    return this.messages.filter(
      (message) => message.from === userID || message.to === userID,
    );
  }
}
