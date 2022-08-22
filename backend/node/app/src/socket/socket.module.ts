import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SocketGateway } from '@socket/socket.gateway';
import { SocketInterceptor } from '@socket/socket.interceptor';
// import { SocketService } from '@socket/socket.service';
import { UserSocketStore } from '@socket/storage/user.socket.store';
import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import { UserSocketService } from '@socket/service/user.socket.service';
import { MainSocketService } from '@socket/service/main.socket.service';
import { ChannelSocketService } from '@socket/service/channel.socket.service';
import { SocketException } from '@socket/socket.exception';

@Module({
  imports: [JwtModule],
  providers: [
    SocketGateway,
    {
      provide: 'socketInterceptor',
      useClass: SocketInterceptor,
    },
    // {
    //   provide: 'APP_FILTER',
    //   useClass: SocketException,
    // },
    MainSocketService,
    UserSocketService,
    ChannelSocketService,
    // SocketService, // todo: delete: 위의 서비스로 분할 예정
    // MessageStore,
    UserSocketStore,
    ChannelSocketStore,
  ],
})
export class SocketModule {}
