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
  @SubscribeMessage('test')
  testUpdate(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody() targetId: string,
  ) {
    // todo: test
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
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('channel') channelCreateDto: ChannelCreateDto,
  ) {
    client.channel = await this.channelSocketService.createChannel(
      client.user,
      channelCreateDto,
    );

    client.join(`room:channel:${client.channel.channelInfo.channelIdx}`);
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
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('channel') channelUpdateDto: ChannelUpdateDto,
  ) {
    this.channelSocketService.updateChannel(client.channel, channelUpdateDto);

    this.server.emit('updateChannel', client.channel);
  }

  @UseInterceptors(
    new ChannelInterceptor(false, false),
    new SocketBodyCheckInterceptor('channelId'),
  )
  @SubscribeMessage('inChannel')
  async inChannel(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('channelId', ParseIntPipe) channelId: number,
    @MessageBody('password') password?: string,
  ) {
    // todo: password도 응답할 때 빼야할 지 고민 해봐야 함
    client.channel = await this.channelSocketService.inChannel(
      client.user,
      channelId,
      password,
    );
    this.userSocketService.switchStatus(client.user, 'watchingGame');

    client.emit('inChannel', client.channel);
    client
      .to(`room:channel:${client.channel.channelInfo.channelIdx}`)
      .emit('joinUser', client.user.userId);
  }

  @UseInterceptors(
    new ChannelInterceptor(false, false),
    new SocketBodyCheckInterceptor('channelId'),
  )
  @SubscribeMessage('outChannel')
  outChannel(@ConnectedSocket() client: ClientInstance) {
    const channelStatus = this.channelSocketService.outChannel(
      client.user,
      client.channel,
    );
    this.userSocketService.switchStatus(client.user, 'online');

    client.emit('outChannel');

    if (channelStatus.userExist)
      client
        .to(`room:channel:${client.channel.channelInfo.channelIdx}`)
        .emit('exitUser', client.user.userId);
    else {
      this.server.emit('deleteChannel', client.channel.channelInfo.channelIdx);
      this.channelSocketService.deleteChannel(
        client.channel.channelInfo.channelIdx,
      );
    }

    if (channelStatus.adminChange)
      this.server.emit('adminChange', {
        channelId: client.channel.channelInfo.channelIdx,
        adminId: client.channel.channelInfo.adminId,
      });

    client.channel = undefined;
  }

  @UseInterceptors(
    new ChannelInterceptor(false, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('inviteUser')
  inviteUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    this.channelSocketService.inviteUser(client.channel, userId);

    client.to(`room:user:${userId}`).emit('inviteUser', {
      channelId: client.channel.channelInfo.channelIdx,
      channelName: client.channel.channelInfo.channelName,
    });
  }

  @UseInterceptors(
    new ChannelInterceptor(true, true),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('kickOutUser')
  kickOutUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    this.channelSocketService.kickOutUser(client.channel, userId);

    client.to(`room:user:${userId}`).emit('kickOut');
    client
      .to(`room:channel:${client.channel.channelInfo.channelIdx}`)
      .emit('kickOutUser', userId);
  }

  @UseInterceptors(
    new ChannelInterceptor(true, true),
    new SocketBodyCheckInterceptor('mutedUser'),
  )
  @SubscribeMessage('muteUser')
  muteUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('mutedUser') mutedUser: MutedUser,
  ) {
    this.channelSocketService.mutedUser(client.channel, mutedUser);

    this.server
      .to(`room:channel:${client.channel.channelInfo.channelIdx}`)
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
      .to(`room:channel:${client.channel.channelInfo.channelIdx}`)
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
        .in(`room:channel:${client.channel.channelInfo.channelIdx}`)
        .emit('channel:readyGame', {
          matcher: client.user.userId,
        });
      return;
    }
    this.server
      .in(`room:channel:${client.channel.channelInfo.channelIdx}`)
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
        .in(`room:channel:${client.channel.channelInfo.channelIdx}`)
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
      .to(`room:channel:${client.channel.channelInfo.channelIdx}`)
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
            .to(`room:user:${client.user.userId}`)
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
          .to(`room:user:${client.user.userId}`)
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
          .to(`room:user:${client.user.userId}`)
          .emit('user:friendChanged', {
            userId: client.user.userId,
            targetId,
            isFollowing: false,
          });
      });
  }
}
