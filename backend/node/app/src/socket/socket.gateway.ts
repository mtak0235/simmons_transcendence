import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Handshake } from 'socket.io/dist/socket';
import { DefaultEventsMap, EventsMap } from 'socket.io/dist/typed-events';
import { UserDto } from '@socket/dto/user.socket.dto';
import {
  ChannelCreateDto,
  ChannelDto,
  ChannelUpdateDto,
} from '@socket/dto/channel.socket.dto';
import { Namespace, Server, Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';
import {
  Logger,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  SocketException,
  SocketExceptionFilter,
} from '@socket/socket.exception';
import { MainSocketService } from '@socket/service/main.socket.service';
import { UserSocketService } from '@socket/service/user.socket.service';
import { ChannelSocketService } from '@socket/service/channel.socket.service';
import { UserSocketStore } from '@socket/storage/user.socket.store';
import { SocketBodyCheckInterceptor } from '@socket/interceptor/index.socket.interceptor';
import { HasChannelInterceptor } from '@socket/interceptor/channel.socket.interceptor';

// export interface CustomHandshake extends Handshake {
//   test: string;
// }
//
// export class SocketInstance<
//   ListenEvents extends EventsMap = DefaultEventsMap,
//   EmitEvents extends EventsMap = ListenEvents,
//   ServerSideEvents extends EventsMap = DefaultEventsMap,
//   SocketData = any,
// > extends Socket {
//   readonly handshake: CustomHandshake;
//
//   user: UserDto;
//   channel: ChannelDto;
//
//   constructor(
//     nsp: Namespace<ListenEvents, EmitEvents, ServerSideEvents>,
//     client: Client<ListenEvents, EmitEvents, ServerSideEvents>,
//     auth: object,
//   ) {
//     super(nsp, client, auth);
//   }
// }

export class SocketInstance extends Socket {
  user: UserDto;
  channel: ChannelDto;
}

@WebSocketGateway(4000)
@UseFilters(SocketExceptionFilter)
@UsePipes(new ValidationPipe())
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // todo: delete: 어디에 사용해야할 지 아직 모르겠음 =>  디버깅용
  private logger: Logger = new Logger('SocketGateway');

  constructor(
    private readonly mainSocketService: MainSocketService,
    private readonly userSocketService: UserSocketService,
    private readonly channelSocketService: ChannelSocketService,
    private readonly userSocketStore: UserSocketStore, // todo: delete: store 접근은 service layer에서 해야함
  ) {}

  /* ============================================= */
  /*            #1 Handling Connection             */
  /* ============================================= */

  async handleConnection(socket: SocketInstance) {
    try {
      const userInfo = await this.mainSocketService.verifyUser(
        socket.handshake.headers['access_token'],
      );
      console.log(userInfo);
      const mainPageDto = await this.mainSocketService.setClient(userInfo);
      socket.user = mainPageDto.me;

      socket.join(`room:user:${socket.user.userId}`);
      socket.emit('user:connected', mainPageDto);
      socket.broadcast.emit('user:connectedUser', {
        // todo: user 또는 main 둘중 하나 생각해 봐야함
        userId: socket.user.userId,
        username: socket.user.username,
        status: socket.user.status,
      });
    } catch (err) {
      if (err instanceof SocketException) socket.emit('error', err);
      else socket.emit('error', { error: 'server', message: 'unKnown' });

      socket.disconnect();
    }
  }

  async handleDisconnect(socket: SocketInstance): Promise<any> {
    if (socket.user) {
      this.userSocketService.switchStatus(socket.user, 'offline');

      socket.broadcast.emit('user:disconnectUser', {
        // todo: user 또는 main 둘중 하나 생각해 봐야함
        userId: socket.user.userId,
        status: socket.user.status,
      });
    }
  }

  // todo: delete: 개발용 코드
  @UseInterceptors(new SocketBodyCheckInterceptor('test', 'world'))
  @SubscribeMessage('test')
  testUpdate(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody() targetId: string,
  ) {
    this.userSocketStore.update(socket.user, {
      follows: [parseInt(targetId, 10)],
    });
  }

  /* ============================================= */
  /*              #2 Channel Gateway               */
  /* ============================================= */

  @UseInterceptors(HasChannelInterceptor)
  @UseInterceptors(new SocketBodyCheckInterceptor('channel'))
  @SubscribeMessage('createChannel')
  async createChannel(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('channel') channel: ChannelCreateDto,
  ) {
    socket.channel = await this.channelSocketService.createChannel(
      socket.user.userId,
      channel,
    );

    socket.join(socket.channel.channelInfo.channelKey);
    socket.emit('channel:createChannel', socket.channel);
    socket.broadcast.emit('main:createdNewChannel', socket.channel.channelInfo);
  }

  @UseInterceptors(new SocketBodyCheckInterceptor('channel'))
  @SubscribeMessage('modifyChannel')
  modifyGame(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('channel') channel: ChannelUpdateDto,
  ) {
    // todo: development
  }

  @SubscribeMessage('inChannel')
  inChannel(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
  }

  @SubscribeMessage('outChannel')
  outChannel(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
  }

  @SubscribeMessage('inviteUser')
  inviteUser(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
  }

  @SubscribeMessage('kickOutUser')
  kickOutUser(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
  }

  @SubscribeMessage('muteUser')
  muteUser(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
    // this.channelSocketService.mute
  }

  @SubscribeMessage('waitingGame')
  waitingGame(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
    this.channelSocketService.waitingGame(socket, this.server);
  }

  @SubscribeMessage('readyGame')
  readyGame(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
    this.channelSocketService.readyGame(socket, this.server);
  }

  @SubscribeMessage('endGame')
  endGame(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('result') result: number,
  ) {
    // todo: development
    return this.channelSocketService.endGame(socket, this.server, result);
  }

  @SubscribeMessage('sendMSG')
  sendMSG(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('msg') msg: string,
  ) {
    // todo: development
    this.channelSocketService.sendMSG(socket, msg);
  }

  @SubscribeMessage('sendDM')
  sendDM(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('targetId') targetId: string,
    @MessageBody('msg') msg: string,
  ) {
    // todo: development
    this.channelSocketService.sendDM(socket, targetId, msg);
  }

  /* ============================================= */
  /*                #2 User Gateway                */
  /* ============================================= */

  @SubscribeMessage('blockUser')
  blockUser(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('targetId') targetId: number,
  ) {
    // todo: development
    return this.userSocketService.block(socket, targetId, this.server);
  }

  @SubscribeMessage('followUser')
  followUser(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('targetId') targetId: number,
  ) {
    // todo: development
    return this.userSocketService.friendChanged(
      socket,
      targetId,
      true,
      this.server,
    );
  }

  @SubscribeMessage('unfollowUser')
  unfollowUser(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('targetId') targetId: number,
  ) {
    // todo: development
    return this.userSocketService.friendChanged(
      socket,
      targetId,
      false,
      this.server,
    );
  }
}
