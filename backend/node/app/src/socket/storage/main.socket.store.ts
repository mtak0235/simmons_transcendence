import { Injectable } from '@nestjs/common';

import { ClientInstance } from '@socket/socket.gateway';
import BaseSocketStore from '@socket/storage/base.socket.store';

@Injectable()
export class MainSocketStore extends BaseSocketStore<ClientInstance> {
  constructor() {
    super();
  }
}
