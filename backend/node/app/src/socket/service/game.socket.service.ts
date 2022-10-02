import { Injectable } from '@nestjs/common';
import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import { ClientInstance } from '@socket/socket.gateway';

@Injectable()
export class GameSocketService {
  constructor(private readonly channelSocketStore: ChannelSocketStore) {}

  initialGameSetting(client: ClientInstance) {
    client.channel.gameInfo = this.channelSocketStore.initialGameSetting();
  }
}
