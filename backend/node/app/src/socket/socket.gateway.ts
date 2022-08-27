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
import { HasChannelInterceptor } from '@socket/interceptor/channel.socket.interceptor';
import { channel } from 'diagnostics_channel';

export class ClientInstance extends Socket {
  user: UserDto;
  channel: ChannelDto;
}

@WebSocketGateway(4000)
@UseFilters(SocketExceptionFilter)
@UsePipes(new ValidationPipe())
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly mainSocketService: MainSocketService,
    private readonly userSocketService: UserSocketService,
    private readonly channelSocketService: ChannelSocketService,
    private readonly userSocketStore: UserSocketStore, // todo: delete: store 접근은 service layer에서 해야함
  ) {}

  /* ============================================= */
  /*            #1 Handling Connection             */

  /* ============================================= */

  async handleConnection(client: ClientInstance) {
    try {
      const userInfo = await this.mainSocketService.verifyUser(
        client.handshake.headers['access_token'],
      );
      console.log(userInfo);
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

  async handleDisconnect(client: ClientInstance): Promise<any> {
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
    @ConnectedSocket() client: ClientInstance,
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
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('channel') channel: ChannelCreateDto,
  ) {
    client.channel = await this.channelSocketService.createChannel(
      client.user.userId,
      channel,
    );

    client.join(client.channel.channelInfo.channelKey.toString());
    client.emit('channel:createChannel', client.channel);
    client.broadcast.emit('main:createdNewChannel', client.channel.channelInfo);
  }

  @UseInterceptors(new SocketBodyCheckInterceptor('channel'))
  @SubscribeMessage('modifyChannel')
  modifyGame(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('channel') channel: ChannelUpdateDto,
  ) {
    // todo: development
  }

  @SubscribeMessage('inChannel')
  inChannel(@ConnectedSocket() client: ClientInstance) {
    // todo: development
  }

  @SubscribeMessage('outChannel')
  outChannel(@ConnectedSocket() client: ClientInstance) {
    // todo: development
  }

  @SubscribeMessage('inviteUser')
  inviteUser(@ConnectedSocket() client: ClientInstance) {
    // todo: development
  }

  @SubscribeMessage('kickOutUser')
  kickOutUser(@ConnectedSocket() client: ClientInstance) {
    // todo: development
  }

  @SubscribeMessage('muteUser')
  muteUser(@ConnectedSocket() client: ClientInstance) {
    // todo: development
    // this.channelSocketService.mute
  }

  @SubscribeMessage('waitingGame')
  waitingGame(@ConnectedSocket() client: ClientInstance) {
    this.channelSocketService.waitingGame(client.channel, client.user.userId);
    this.server
      .to(client.channel.channelInfo.channelKey.toString())
      .emit('channel:getGameParticipants', {
        matcher: client.channel.matcher,
        waiter: client.channel.waiter,
      });
  }

  @SubscribeMessage('readyGame')
  readyGame(@ConnectedSocket() client: ClientInstance) {
    this.channelSocketService.readyGame(
      client.channel.matcher,
      client.user.userId,
    );
    if (
      client.channel.matcher.filter((value) => value.isReady == false).length
    ) {
      this.server
        .in(client.channel.channelInfo.channelKey.toString())
        .emit('channel:readyGame', {
          matcher: client.user.userId,
        });
      return;
    }
    this.server
      .in(client.channel.channelInfo.channelKey.toString())
      .emit('channel:startGame', {
        waiter: client.channel.waiter,
        matcher: client.channel.matcher,
        score: client.channel.channelInfo.score,
      });
  }

  @SubscribeMessage('endGame')
  endGame(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('result', ParseIntPipe) result: number,
  ) {
    return this.channelSocketService.endGame(this.server, result);
  }

  @SubscribeMessage('sendMSG')
  sendMSG(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('msg') msg: string,
  ) {
    // this.channelSocketService.sendMSG(client, msg);
  }

  @SubscribeMessage('sendDM')
  sendDM(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId') targetId: string,
    @MessageBody('msg') msg: string,
  ) {
    this.channelSocketService.sendDM(client, targetId, msg);
  }

  /* ============================================= */
  /*                #2 User Gateway                */

  /* ============================================= */

  @SubscribeMessage('blockUser')
  blockUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId', ParseIntPipe) targetId: number,
  ) {
    // todo: development
    this.userSocketService
      .block(
        client.user.blocks,
        client.user.follows,
        client.user.userId,
        targetId,
      )
      .then();
    if (this.userSocketService.isFollowing(client.user.follows, targetId)) {
      this.userSocketService
        .unfollow(client.user.follows, targetId, client.user.userId)
        .then(() => {
          this.server
            .to('room:user:' + client.user.userId.toString())
            .emit('user:friendChanged', {
              userId: client.user.userId,
              targetId,
              isFollowing: false,
            });
        });
    }
  }

  @SubscribeMessage('followUser')
  followUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId', ParseIntPipe) targetId: number,
  ) {
    // todo: development
    this.userSocketService
      .follows(
        client.user.follows,
        client.user.userId,
        targetId,
        client.user.blocks,
      )
      .then(() => {
        this.server
          .to('room:user:' + client.user.userId.toString())
          .emit('user:friendChanged', {
            userId: client.user.userId,
            targetId,
            isFollowing: true,
          });
      });
  }

  @SubscribeMessage('unfollowUser')
  unfollowUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId', ParseIntPipe) targetId: number,
  ) {
    // todo: development
    this.userSocketService
      .unfollow(client.user.follows, targetId, client.user.userId)
      .then(() => {
        this.server
          .to('room:user:' + client.user.userId.toString())
          .emit('user:friendChanged', {
            userId: client.user.userId,
            targetId,
            isFollowing: false,
          });
      });
  }
}
