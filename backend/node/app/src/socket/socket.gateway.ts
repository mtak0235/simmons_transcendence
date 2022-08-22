import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger, UseFilters } from '@nestjs/common';
import { SocketInterceptor } from '@socket/socket.interceptor';
// import { SocketService } from '@socket/socket.service';
import { MainSocketService } from '@socket/service/main.socket.service';
import { UserSocketService } from '@socket/service/user.socket.service';
import { ChannelSocketService } from '@socket/service/channel.socket.service';
import { UserSocketStore } from '@socket/storage/user.socket.store';
import { UserDto } from '@socket/dto/user.socket.dto';
import {
  SocketException,
  SocketExceptionFilter,
} from '@socket/socket.exception';

export class Client extends Socket {
  user: UserDto;
}

@WebSocketGateway(4000)
@UseFilters(SocketExceptionFilter)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // todo: delete: 어디에 사용해야할 지 아직 모르겠음
  private logger: Logger = new Logger('SocketGateway');

  // todo: delete: 어디에 사용해야할 지 아직 모르겠음
  @Inject('socketInterceptor')
  private eventInterceptor: SocketInterceptor;

  constructor(
    private readonly mainSocketService: MainSocketService,
    private readonly userSocketService: UserSocketService,
    private readonly channelSocketService: ChannelSocketService,
    private readonly userSocketStore: UserSocketStore, // todo: delete: store 접근은 service layer에서 해야함
  ) {}

  /* ============================================= */
  /*            #1 Handling Connection             */
  /* ============================================= */

  async handleConnection(client: Client) {
    try {
      const userInfo = await this.mainSocketService.verifyUser(
        client.handshake.headers['access_token'],
      );
      const mainPageDto = await this.mainSocketService.setClient(userInfo);
      client.user = mainPageDto.me;

      client.emit('connected', mainPageDto);
      client.broadcast.emit('connectUser', {
        userId: client.user.userId,
        username: client.user.username,
        status: client.user.status,
      });
    } catch (err) {
      if (err instanceof SocketException) client.emit('error', err);
      else client.emit('error', { error: 'server', message: 'unKnown' });

      client.disconnect();
    }
  }

  async handleDisconnect(client: Client): Promise<any> {
    if (client.user) {
      this.userSocketService.switchStatus(client.user, 'offline');

      client.broadcast.emit('disconnectUser', {
        userId: client.user.userId,
        status: client.user.status,
      });
    }
  }

  // todo: delete: 개발용 코드
  @SubscribeMessage('testUpdate')
  testUpdate(
    @ConnectedSocket() client: Client,
    @MessageBody() targetId: string,
  ) {
    this.userSocketStore.update(client.user, {
      follows: [parseInt(targetId, 10)],
    });
    console.log(client.user);
  }

  /* ============================================= */
  /*              #2 Channel Gateway               */
  /* ============================================= */

  @SubscribeMessage('createChannel')
  createChannel(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('modifyChannel')
  modifyGame(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('inChannel')
  inChannel(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('outChannel')
  outChannel(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('inviteUser')
  inviteUser(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('kickOutUser')
  kickOutUser(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('muteUser')
  muteUser(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('waitingGame')
  waitingGame(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('readyGame')
  readyGame(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('endGame')
  endGame(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('sendMSG')
  sendMSG(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('sendDM')
  sendDM(@ConnectedSocket() client: Client) {
    // todo: development
  }

  /* ============================================= */
  /*                #2 User Gateway                */
  /* ============================================= */

  @SubscribeMessage('blockUser')
  blockUser(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('followUser')
  followUser(@ConnectedSocket() client: Client) {
    // todo: development
  }

  @SubscribeMessage('unfollowUser')
  unfollowUser(@ConnectedSocket() client: Client) {
    // todo: development
  }
}
