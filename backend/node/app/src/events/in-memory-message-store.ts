export interface Message {
  msg: string;
  from: string;
  to: string;
}
export class InMemoryMessageStore {
  // constructor() {
  //   this.messages = new Array<Message>;
  // }
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
