import { Injectable } from '@nestjs/common';

import { ClientInstance } from '@socket/socket.gateway';

@Injectable()
export class MainSocketStore {
  private clients: Map<number, ClientInstance>;

  constructor() {
    this.clients = new Map<number, ClientInstance>();
  }

  has(userId: number): boolean {
    return this.clients.has(userId);
  }

  set(userId: number, client: ClientInstance) {
    this.clients.set(userId, client);
  }

  get(userId: number): ClientInstance {
    return this.clients.get(userId);
  }

  delete(userId: number): void {
    this.clients.delete(userId);
  }
}
