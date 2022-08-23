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
import {
  Inject,
  Logger,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ChannelCreateDto,
  ChannelDto,
  ChannelUpdateDto,
} from '@socket/dto/channel.socket.dto';
import { MainSocketService } from '@socket/service/main.socket.service';
import { UserSocketService } from '@socket/service/user.socket.service';
import { ChannelSocketService } from '@socket/service/channel.socket.service';
import { UserSocketStore } from '@socket/storage/user.socket.store';
import { UserDto } from '@socket/dto/user.socket.dto';
import {
  SocketException,
  SocketExceptionFilter,
} from '@socket/socket.exception';
import { HasChannelInterceptor } from '@socket/interceptor/channel.socket.interceptor';
import { SocketBodyCheckInterceptor } from '@socket/interceptor/index.socket.interceptor';
import { Handshake } from 'socket.io/dist/socket';

export interface CustomHandshake extends Handshake {
  test: string;
}

export class Client extends Socket {
  readonly handshake: CustomHandshake;

  user: UserDto;
  channel: ChannelDto;
}

@WebSocketGateway(4000)
@UseFilters(SocketExceptionFilter)
@UsePipes(new ValidationPipe())
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // todo: delete: 어디에 사용해야할 지 아직 모르겠음
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

  async handleConnection(client: Client) {
    try {
      const userInfo = await this.mainSocketService.verifyUser(
        client.handshake.headers['access_token'],
      );
      const mainPageDto = await this.mainSocketService.setClient(userInfo);
      client.user = mainPageDto.me;

      client.join(`room:user:${client.user.userId}`);
      client.emit('user:connected', mainPageDto);
      client.broadcast.emit('user:connectedUser', {
        // todo: user 또는 main 둘중 하나 생각해 봐야함
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

      client.broadcast.emit('user:disconnectUser', {
        // todo: user 또는 main 둘중 하나 생각해 봐야함
        userId: client.user.userId,
        status: client.user.status,
      });
    }
  }

  // todo: delete: 개발용 코드
  @UseInterceptors(new SocketBodyCheckInterceptor('test', 'world'))
  @SubscribeMessage('test')
  testUpdate(
    @ConnectedSocket() client: Client,
    @MessageBody() targetId: string,
  ) {
    this.userSocketStore.update(client.user, {
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
    @ConnectedSocket() client: Client,
    @MessageBody('channel') channel: ChannelCreateDto,
  ) {
    client.channel = await this.channelSocketService.createChannel(
      client.user.userId,
      channel,
    );

    client.join(client.channel.channelInfo.channelKey);
    client.emit('channel:createChannel', client.channel);
    client.broadcast.emit('main:createdNewChannel', client.channel.channelInfo);
  }

  @UseInterceptors(new SocketBodyCheckInterceptor('channel'))
  @SubscribeMessage('modifyChannel')
  modifyGame(
    @ConnectedSocket() client: Client,
    @MessageBody('channel') channel: ChannelUpdateDto,
  ) {}

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
  blockUser(
    @ConnectedSocket() client: Client,
    @MessageBody('targetId') targetId: number,
  ) {
    // todo: development
    this.userSocketService.block(client, targetId);
    this.logger.log(client.user);
  }

  @SubscribeMessage('followUser')
  followUser(
    @ConnectedSocket() client: Client,
    @MessageBody('targetId') targetId: number,
  ) {
    // todo: development
    this.userSocketService.friendChanged(client, targetId, true);
    this.logger.log(client.user);
  }

  @SubscribeMessage('unfollowUser')
  unfollowUser(
    @ConnectedSocket() client: Client,
    @MessageBody('targetId') targetId: number,
  ) {
    // todo: development
    this.userSocketService.friendChanged(client, targetId, false);
    this.logger.log(client.user);
  }
}
