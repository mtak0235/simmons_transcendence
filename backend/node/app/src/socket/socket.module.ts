import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SocketGateway } from '@socket/socket.gateway';
import { UserSocketStore } from '@socket/storage/user.socket.store';
import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import { UserSocketService } from '@socket/service/user.socket.service';
import { MainSocketService } from '@socket/service/main.socket.service';
import { ChannelSocketService } from '@socket/service/channel.socket.service';
import { ChannelInterceptors } from '@socket/interceptor/channel.socket.interceptor';

@Module({
  imports: [JwtModule],
  providers: [
    SocketGateway,
    MainSocketService,
    UserSocketService,
    ChannelSocketService,
    UserSocketStore,
    ChannelSocketStore,
    ...ChannelInterceptors,
  ],
})
export class SocketModule {}
