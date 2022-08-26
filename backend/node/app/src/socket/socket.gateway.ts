import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UserDto } from '@socket/dto/user.socket.dto';
import {
  ChannelCreateDto,
  ChannelDto,
  ChannelUpdateDto,
} from '@socket/dto/channel.socket.dto';
import { Server, Socket } from 'socket.io';
import {
  Logger,
  ParseIntPipe,
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
import { ChannelInterceptor } from '@socket/interceptor/channel.socket.interceptor';

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
  ) {}

  /* ============================================= */
  /*            #1 Handling Connection             */
  /* ============================================= */

  async handleConnection(socket: SocketInstance) {
    try {
      const userInfo = await this.mainSocketService.verifyUser(
        socket.handshake.headers['access_token'],
      );
      const mainPageDto = await this.mainSocketService.setClient(userInfo);
      socket.user = mainPageDto.me;

      this.logger.debug('rooms on connection', socket.rooms);
      socket.join(`room:user:${socket.user.userId}`);
      socket.emit('user:connected', mainPageDto);
      socket.broadcast.emit('user:connectedUser', {
        // todo: user 또는 main 둘중 하나 생각해 봐야함
        userId: socket.user.userId,
        username: socket.user.username,
        status: socket.user.status,
      });
    } catch (err) {
      console.log(err);
      if (err instanceof SocketException) socket.emit('error', err);
      else socket.emit('error', { error: 'server', message: 'unKnown' });

      socket.disconnect();
    }
  }

  async handleDisconnect(socket: SocketInstance): Promise<any> {
    if (socket.user) {
      this.userSocketService.switchStatus(socket.user, 'offline');

      socket.broadcast.emit('user:disconnectedUser', {
        // todo: user 또는 main 둘중 하나 생각해 봐야함
        userId: socket.user.userId,
        status: socket.user.status,
      });
    }
  }

  // todo: delete: 개발용 코드
  @SubscribeMessage('test')
  testUpdate(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody() targetId: string,
  ) {
    socket.emit('test', socket.channel);
  }

  /* ============================================= */
  /*              #2 Channel Gateway               */
  /* ============================================= */

  @UseInterceptors(
    new ChannelInterceptor(false, false),
    new SocketBodyCheckInterceptor('channel'),
  )
  @SubscribeMessage('createChannel')
  async createChannel(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('channel') channelCreateDto: ChannelCreateDto,
  ) {
    socket.channel = await this.channelSocketService.createChannel(
      socket.user,
      channelCreateDto,
    );

    socket.join(socket.channel.channelInfo.channelKey);
    socket.emit('channel:createChannel', socket.channel);
    socket.broadcast.emit('main:createdNewChannel', socket.channel.channelInfo);
  }

  @UseInterceptors(
    new ChannelInterceptor(true, true),
    new SocketBodyCheckInterceptor('channel'),
  )
  @UseInterceptors(new SocketBodyCheckInterceptor('channel'))
  @SubscribeMessage('modifyChannel')
  modifyGame(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('channel') channel: ChannelUpdateDto,
  ) {
    // todo: development
  }

  @UseInterceptors(
    new ChannelInterceptor(false, false),
    new SocketBodyCheckInterceptor('channelId'),
  )
  @SubscribeMessage('inChannel')
  async inChannel(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('channelId', ParseIntPipe) channelId: number,
    @MessageBody('password') password?: string,
  ) {
    // todo: password도 응답할 때 빼야할 지 고민 해봐야 함
    socket.channel = await this.channelSocketService.inChannel(
      socket.user,
      channelId,
      password,
    );
    this.userSocketService.switchStatus(socket.user, 'watchingGame');

    socket.emit('inChannel', socket.channel);
    socket
      .to(socket.channel.channelInfo.channelKey)
      .emit('joinUser', socket.user.userId);
  }

  @UseInterceptors(
    new ChannelInterceptor(false, false),
    new SocketBodyCheckInterceptor('channelId'),
  )
  @SubscribeMessage('outChannel')
  outChannel(@ConnectedSocket() socket: SocketInstance) {
    const userExist = this.channelSocketService.outChannel(
      socket.user,
      socket.channel,
    );
    this.userSocketService.switchStatus(socket.user, 'online');

    socket.emit('outChannel');

    if (userExist)
      socket
        .to(socket.channel.channelInfo.channelKey)
        .emit('exitUser', socket.user.userId);
    else
      this.server.emit('deleteChannel', socket.channel.channelInfo.channelIdx);

    socket.channel = undefined;
  }

  @UseInterceptors(
    new ChannelInterceptor(false, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('inviteUser')
  inviteUser(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    this.channelSocketService.inviteUser(socket.channel, userId);

    socket.to(`room:user:${userId}`).emit('inviteUser', {
      channelId: socket.channel.channelInfo.channelIdx,
      channelName: socket.channel.channelInfo.channelName,
    });
  }

  @UseInterceptors(
    new ChannelInterceptor(true, true),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('kickOutUser')
  kickOutUser(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
  }

  @UseInterceptors(
    new ChannelInterceptor(true, true),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('muteUser')
  muteUser(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
    // this.channelSocketService.mute
  }

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('waitingGame')
  waitingGame(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
    this.channelSocketService.waitingGame(socket);
  }

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('readyGame')
  readyGame(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
    this.channelSocketService.readyGame(socket, this.server);
  }

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('endGame')
  endGame(@ConnectedSocket() socket: SocketInstance) {
    // todo: development
    this.channelSocketService.endGame(socket, this.server);
  }

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('sendMSG')
  sendMSG(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('msg') msg: string,
  ) {
    // todo: development
    this.channelSocketService.sendMSG(socket, msg);
  }

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
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
