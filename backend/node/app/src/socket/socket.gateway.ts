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
  MutedUser,
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
import { SocketBodyCheckInterceptor } from '@socket/interceptor/index.socket.interceptor';
import { HasChannelInterceptor } from '@socket/interceptor/channel.socket.interceptor';
import { channel } from 'diagnostics_channel';
import { ChannelInterceptor } from '@socket/interceptor/channel.socket.interceptor';
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
  ) {}

  /* ============================================= */
  /*            #1 Handling Connection             */

  /* ============================================= */

  async handleConnection(client: ClientInstance) {
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
      console.log(err);
      if (err instanceof SocketException) socket.emit('error', err);
      else socket.emit('error', { error: 'server', message: 'unKnown' });
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

    client.join(client.channel.channelInfo.channelKey.toString());
    client.emit('channel:createChannel', client.channel);
    client.broadcast.emit('main:createdNewChannel', client.channel.channelInfo);
  }

  @UseInterceptors(
    new ChannelInterceptor(true, true),
    new SocketBodyCheckInterceptor('channel'),
  )
  @UseInterceptors(new SocketBodyCheckInterceptor('channel'))
  @SubscribeMessage('modifyChannel')
  modifyGame(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('channel') channelUpdateDto: ChannelUpdateDto,
  ) {
    this.channelSocketService.updateChannel(socket.channel, channelUpdateDto);

    this.server.emit('updateChannel', socket.channel);
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
    const channelStatus = this.channelSocketService.outChannel(
      socket.user,
      socket.channel,
    );
    this.userSocketService.switchStatus(socket.user, 'online');

    socket.emit('outChannel');

    if (channelStatus.userExist)
      socket
        .to(socket.channel.channelInfo.channelKey)
        .emit('exitUser', socket.user.userId);
    else {
      this.server.emit('deleteChannel', socket.channel.channelInfo.channelIdx);
      this.channelSocketService.deleteChannel(
        socket.channel.channelInfo.channelIdx,
      );
    }

    if (channelStatus.adminChange)
      this.server.emit('adminChange', {
        channelId: socket.channel.channelInfo.channelIdx,
        adminId: socket.channel.channelInfo.adminId,
      });

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
  kickOutUser(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    this.channelSocketService.kickOutUser(socket.channel, userId);

    socket.to(`room:user:${userId}`).emit('kickOut');
    socket
      .to(socket.channel.channelInfo.channelKey)
      .emit('kickOutUser', userId);
  }

  @UseInterceptors(
    new ChannelInterceptor(true, true),
    new SocketBodyCheckInterceptor('mutedUser'),
  )
  @SubscribeMessage('muteUser')
  muteUser(
    @ConnectedSocket() socket: SocketInstance,
    @MessageBody('mutedUser') mutedUser: MutedUser,
  ) {
    this.channelSocketService.mutedUser(socket.channel, mutedUser);

    this.server
      .to(`room:channel:${socket.channel.channelInfo.channelIdx}`)
      .emit('mutedUser', mutedUser);
  }

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
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

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
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

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('endGame')
  endGame(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('result', ParseIntPipe) result: number,
  ) {
    this.channelSocketService.endGame(client.channel, result).then(() => {
      this.server
        .in(client.channel.channelInfo.channelKey.toString())
        .emit('gameOver', {
          waiter: client.channel.waiter,
          matcher: client.channel.matcher,
        });
    });
  }
  //todo: intereceptor에 mute되었는지 검사 필요.
  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('sendMSG')
  sendMSG(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('msg') msg: string,
  ) {
    client
      .to(client.channel.channelInfo.channelKey.toString())
      .emit('channel:getMSG', {
        userID: client.user.userId,
        userName: client.user.username,
        msg,
      });
  }
  //todo: interceptor에서 block 확인

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('sendDM')
  sendDM(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId') targetId: string,
    @MessageBody('msg') msg: string,
  ) {
    client.to(`room:user:${targetId}`).emit('getDM', {
      userID: client.user.userId,
      userName: client.user.username,
      msg,
    });
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
