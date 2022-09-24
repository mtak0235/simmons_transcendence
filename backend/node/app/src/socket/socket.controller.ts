import { Controller, Get } from '@nestjs/common';
import { UserSocketStore } from '@socket/storage/user.socket.store';
import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import { MainSocketStore } from '@socket/storage/main.socket.store';

@Controller('socket')
export class SocketController {
  constructor(
    private readonly userSocketStore: UserSocketStore,
    private readonly channelSocketStore: ChannelSocketStore,
    private readonly mainSocketStore: MainSocketStore,
  ) {}

  @Get('users')
  getUsers() {
    return this.userSocketStore.findAll();
  }
}
