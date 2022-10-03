import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  STATUS_LAYER,
  UserDto,
  UserInfoDto,
} from '@socket/dto/user.socket.dto';
import {
  ChannelCreateDto,
  ChannelDto,
  ChannelUpdateDto,
} from '@socket/dto/channel.socket.dto';
import { Server, Socket } from 'socket.io';
import {
  HttpException,
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
import { GameSocketService } from '@socket/service/game.socket.service';
import { SocketBodyCheckInterceptor } from '@socket/interceptor/index.socket.interceptor';
import {
  ChannelAuthInterceptor,
  ChannelMessageInterceptor,
} from '@socket/interceptor/channel.socket.interceptor';

export class ClientInstance extends Socket {
  user: UserDto;
  channel: ChannelDto;
}

@WebSocketGateway(4000, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
})
@UseFilters(SocketExceptionFilter)
@UsePipes(new ValidationPipe())
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly mainSocketService: MainSocketService,
    private readonly userSocketService: UserSocketService,
    private readonly channelSocketService: ChannelSocketService,
    private readonly gameSocketService: GameSocketService,
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
      this.mainSocketService.setSocketInstance(userInfo.id, client);

      this.changeStatus(client, 'online');

      client.join(`room:user:${client.user.userId}`);
      client.emit('single:user:connected', mainPageDto);
    } catch (err) {
      // todo: 예외 분기 정확히 작성해야 함
      if (err instanceof HttpException) {
        client.emit(
          'error',
          new SocketException(err.getStatus(), err.message, err.stack),
        );
      } else {
        client.emit(
          'single:user:error',
          new SocketException(500, 'Internal Server Error'),
        );
      }
      this.handleDisconnect(client);
    }
  }

  handleDisconnect(client: ClientInstance): void {
    if (client.user) {
      console.log('================================');
      console.log('================================');
      console.log(client.channel);
      if (client.channel) this.outChannel(client);

      this.mainSocketService.deleteSocketInstance(client.user.userId);

      this.changeStatus(client, 'offline');
      client.rooms.delete(`room:user:${client.user.userId}`);
    }
    client.disconnect();
    client.rooms.clear();
  }

  @UseInterceptors(new SocketBodyCheckInterceptor('status'))
  @SubscribeMessage('changeStatus')
  changeStatus(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('status') status: STATUS_LAYER,
  ) {
    const userInfo: UserInfoDto = {
      userId: client.user.userId,
      username: client.user.username,
      status: status,
    };
    this.userSocketService.switchStatus(client.user, status);

    client.broadcast.emit('broad:user:changeStatus', userInfo);
  }

  // todo: delete: 개발용 코드
  @SubscribeMessage('test')
  testUpdate(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId', ParseIntPipe) targetId: number,
  ) {
    // todo: test
    // console.log(client);
    // console.log(this.server)
    const calledClient = this.mainSocketService.getSocketInstance(targetId);
    console.log(calledClient);
    this.test1(calledClient);
  }

  @SubscribeMessage('test1')
  test1(@ConnectedSocket() client: ClientInstance) {
    client.emit('test1', { text: 'hello world!!' });
  }

  @SubscribeMessage('test2')
  test2(@ConnectedSocket() client: ClientInstance) {
    client.emit('test2', 'hello world!!');
  }

  /* ============================================= */
  /*              #2 Channel Gateway               */
  /* ============================================= */

  @UseInterceptors(
    new ChannelAuthInterceptor({ hasChannel: false }),
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

    // console.log(client);
    this.changeStatus(client, 'inChannel');

    client.join(`room:channel:${client.channel.channelPublic.channelId}`);
    // console.log(client);
    console.log(
      client.rooms.has(`room:channel${client.channel.channelPublic.channelId}`),
    );
    client.emit('single:channel:createChannel', {
      channelPublic: client.channel.channelPublic,
      channelPrivate: client.channel.channelPrivate,
    });
    console.log('test1');
    client.broadcast.emit(
      'broad:channel:createChannel',
      client.channel.channelPublic,
    );
    console.log('test2');
  }

  @UseInterceptors(
    new ChannelAuthInterceptor({ admin: true }),
    new SocketBodyCheckInterceptor('channel'),
  )
  @UseInterceptors(new SocketBodyCheckInterceptor('channel'))
  @SubscribeMessage('modifyChannel')
  async modifyChannel(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('channel') channelUpdateDto: ChannelUpdateDto,
    @MessageBody('password') password?: string,
  ) {
    await this.channelSocketService.updateChannel(
      client.channel,
      channelUpdateDto,
      password,
    );

    this.server.emit(
      'broad:channel:updateChannel',
      client.channel.channelPublic,
    );
  }

  @UseInterceptors(
    new ChannelAuthInterceptor({ hasChannel: false }),
    new SocketBodyCheckInterceptor('channelId'),
  )
  @SubscribeMessage('inChannel')
  async inChannel(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('channelId', ParseIntPipe) channelId: number,
    @MessageBody('password') password?: string,
  ) {
    client.channel = await this.channelSocketService.inChannel(
      client.user,
      channelId,
      password,
    );

    this.changeStatus(client, 'inChannel');

    client.join(`room:channel:${client.channel.channelPublic.channelId}`);
    client.emit('single:channel:inChannel', {
      channelPublic: client.channel.channelPublic,
      channelPrivate: client.channel.channelPrivate,
    });
    // console.log(client);
    console.log(`room:channel:${client.channel.channelPublic.channelId}`);
    this.server
      .to(`room:channel:${client.channel.channelPublic.channelId}`)
      .emit('group:channel:inChannel', { userId: client.user.userId });
  }

  // todo: 게임중에 나가면 어떻게 해야할 지 짜야함
  @UseInterceptors(new ChannelAuthInterceptor())
  @SubscribeMessage('outChannel')
  outChannel(@ConnectedSocket() client: ClientInstance) {
    console.log('찍힘');
    const channelStatus = this.channelSocketService.outChannel(
      client.user,
      client.channel,
    );

    this.changeStatus(client, 'online');

    client.leave(`room:channel:${client.channel.channelPublic.channelId}`);
    client.emit('single:channel:outChannel');

    if (channelStatus.userExist) {
      if (channelStatus.ownerChange || channelStatus.adminChange)
        this.server.emit('broad:channel:setAdmin', {
          channelId: client.channel.channelPublic.channelId,
          ownerId: client.channel.channelPublic.ownerId,
          adminId: client.channel.channelPublic.adminId,
        });

      client
        .to(`room:channel:${client.channel.channelPublic.channelId}`)
        .emit('group:channel:outChannel', { userId: client.user.userId });
    } else {
      this.server.emit(
        'broad:channel:deleteChannel',
        client.channel.channelPublic.channelId,
      );
      this.channelSocketService.deleteChannel(
        client.channel.channelPublic.channelId,
      );
      console.log(client.channel.channelPublic.channelId);
    }

    client.channel = undefined;
  }

  @UseInterceptors(
    new ChannelAuthInterceptor(),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('inviteUser')
  inviteUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    this.channelSocketService.inviteUser(client.channel, userId);

    client.to(`room:user:${userId}`).emit('single:channel:inviteUser', {
      inviterId: client.user.userId,
      channelId: client.channel.channelPublic.channelId,
      channelName: client.channel.channelPublic.channelName,
    });
  }

  @UseInterceptors(
    new ChannelAuthInterceptor({ owner: true }),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('setAdmin')
  setAdmin(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    this.channelSocketService.setAdmin(client.channel, userId);

    this.server.emit('broad:channel:setAdmin', {
      channelId: client.channel.channelPublic.channelId,
      ownerId: client.channel.channelPublic.ownerId,
      adminId: client.channel.channelPublic.adminId,
    });
  }

  @UseInterceptors(
    new ChannelAuthInterceptor({ admin: true }),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('kickOutUser')
  kickOutUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    this.channelSocketService.kickOutUser(client.channel, userId);
    this.outChannel(this.mainSocketService.getSocketInstance(userId));

    client.to(`room:user:${userId}`).emit('single:channel:kickOut');
    client
      .to(`room:channel:${client.channel.channelPublic.channelId}`)
      .emit('group:channel:kickOut', userId);
  }

  @UseInterceptors(
    new ChannelAuthInterceptor({ admin: true }),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('muteUser')
  muteUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId') userId: number,
  ) {
    const mutedUser = this.channelSocketService.mutedUser(
      client.channel,
      userId,
    );

    this.server
      .to(`room:channel:${client.channel.channelPublic.channelId}`)
      .emit('group:channel:muteUser', mutedUser);
  }

  @UseInterceptors(new ChannelAuthInterceptor())
  @SubscribeMessage('waitingGame')
  waitingGame(@ConnectedSocket() client: ClientInstance) {
    this.channelSocketService.waitingGame(client.channel, client.user.userId);
    console.log(client.channel.channelPrivate);
    this.changeStatus(client, 'waitingGame');

    this.server
      .to(`room:channel:${client.channel.channelPublic.channelId}`)
      .emit('group:channel:waitingGame', {
        matcher: client.channel.channelPrivate.matcher,
        waiter: client.channel.channelPrivate.waiter,
      });
  }

  @UseInterceptors(new ChannelAuthInterceptor({ matcher: true }))
  @SubscribeMessage('readyGame')
  readyGame(@ConnectedSocket() client: ClientInstance) {
    const readyCount = this.channelSocketService.readyGame(
      client.channel,
      client.user.userId,
    );

    // startGame 이벤트와 의존관계 생겨야함
    if (readyCount !== 2) {
      this.server
        .to(`room:channel:${client.channel.channelPublic.channelId}`)
        .emit('group:channel:readyGame', client.channel.channelPrivate.matcher);
      return;
    }
    // this.server
    //   .to(`room:channel:${client.channel.channelPublic.channelId}`)
    //   .emit('group:channel:startGame');
    this.startGame(client.channel);

    this.server.emit(
      'broad:channel:startGame',
      client.channel.channelPublic.channelId,
    );
  }

  @UseInterceptors(new ChannelAuthInterceptor())
  @SubscribeMessage('leaveGame')
  leaveGame(@ConnectedSocket() client: ClientInstance) {
    this.channelSocketService.leaveGame(client.channel, client.user.userId);

    this.changeStatus(client, 'inChannel');

    this.server
      .to(`room:channel:${client.channel.channelPublic.channelId}`)
      .emit('group:channel:leaveGame', {
        matcher: client.channel.channelPrivate.matcher,
        waiter: client.channel.channelPrivate.waiter,
      });
  }

  @UseInterceptors(
    new ChannelAuthInterceptor(),
    ChannelMessageInterceptor,
    new SocketBodyCheckInterceptor('message'),
  )
  @SubscribeMessage('sendMessage')
  sendMessage(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('message') message: string,
  ) {
    this.server
      .to(`room:channel:${client.channel.channelPublic.channelId}`)
      .emit('group:channel:sendMessage', {
        sourceId: client.user.userId,
        message: message,
      });
  }

  @UseInterceptors(
    new ChannelAuthInterceptor(),
    ChannelMessageInterceptor,
    new SocketBodyCheckInterceptor('targetId', 'message'),
  )
  @SubscribeMessage('sendDirectMessage')
  async sendDirectMessage(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId', ParseIntPipe) targetId: number,
    @MessageBody('message') message: string,
  ) {
    await this.channelSocketService.sendDm(client.user.userId, targetId);

    this.server
      .to([`room:user:${targetId}`, `room:user:${client.user.userId}`])
      .emit('single:channel:sendDm', {
        sourceId: client.user.userId,
        targetId: targetId,
        message: message,
      });
  }

  /* ============================================= */
  /*                #2 User Gateway                */
  /* ============================================= */

  @UseInterceptors(new SocketBodyCheckInterceptor('userId'))
  @SubscribeMessage('blockUser')
  async blockUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    await this.userSocketService.block(client.user, userId);

    if (client.user.follows.indexOf(userId) !== -1)
      await this.unfollowUser(client, userId);

    client.emit('single:user:blockUser', client.user);
  }

  @UseInterceptors(new SocketBodyCheckInterceptor('userId'))
  @SubscribeMessage('followUser')
  async followUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    await this.userSocketService.follow(client.user, userId);

    client.emit('single:user:followUser', client.user);

    client.to(`room:user:${userId}`).emit('followedUser', client.user.userId);
  }

  @UseInterceptors(new SocketBodyCheckInterceptor('userId'))
  @SubscribeMessage('unfollowUser')
  async unfollowUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    await this.userSocketService.unfollow(client.user, userId);

    client.emit('single:user:unfollowUser', client.user);
  }

  /* ============================================= */
  /*                #3 Game Gateway                */
  /* ============================================= */

  @SubscribeMessage('testGame')
  async testGame(@ConnectedSocket() client: ClientInstance) {
    await this.inChannel(client, 0);
    client.channel.channelPrivate.matcher[0] = {
      userId: 85166,
      isReady: true,
    };
    client.channel.channelPrivate.matcher[1] = {
      userId: client.user.userId,
      isReady: true,
    };

    client.channel.channelPrivate.waiter[0] = 2000;
    client.channel.channelPublic.score = 3;

    client.emit('testGame', client.channel);
  }

  @SubscribeMessage('testStart')
  testStart(@ConnectedSocket() client: ClientInstance) {
    this.startGame(client.channel);
  }

  @SubscribeMessage('inputKey')
  inputKey(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('keyCode', ParseIntPipe) keyCode: number,
    @MessageBody('userIdx', ParseIntPipe) userIdx: number,
  ) {
    if (keyCode !== 38 && keyCode !== 40) return;

    const pos: number[] = this.gameSocketService.movePaddle(
      client.channel.gameInfo,
      client.user.userId,
      keyCode,
      userIdx,
    );

    this.server
      .to(`room:channel:${client.channel.channelPublic.channelId}`)
      .emit('group:game:inputKey', {
        userIdx: userIdx,
        pos: pos,
      });
  }

  startGame(channel: ChannelDto) {
    channel.channelPrivate.matcher.map((user) => {
      this.changeStatus(
        this.mainSocketService.getSocketInstance(user.userId),
        'inGame',
      );
    });

    this.gameSocketService.initialGameSetting(channel);
    this.server
      .to(`room:channel:${channel.channelPublic.channelId}`)
      .emit('group:game:startGame', {
        matcher: channel.gameInfo.matcher,
        ball: channel.gameInfo.ball.pos,
      });

    setTimeout(() => {
      channel.gameInfo.onRound = false;
    }, 2000);

    channel.gameInfo.gameInterval = setInterval(async () => {
      if (
        !this.gameSocketService.monitGame(channel) ||
        !channel.channelPublic.onGame
      ) {
        clearInterval(channel.gameInfo.gameInterval);
        await this.endGame(channel); // todo: endGame 구현
        console.log('game end');
        return;
      }

      if (!channel.gameInfo.onRound) {
        this.server
          .to(`room:channel:${channel.channelPublic.channelId}`)
          .emit('group:game:startRound', {
            matcher: channel.gameInfo.matcher,
            ball: channel.gameInfo.ball.pos,
          });
        this.startRound(channel);
      }
    }, 100); // todo: interval ms, ball speed 로 통일해야 할 수도
  }

  startRound(channel: ChannelDto) {
    this.gameSocketService.resetRoundSetting(channel);

    channel.gameInfo.roundInterval = setInterval(() => {
      if (!this.gameSocketService.monitRound(channel.gameInfo.ball)) {
        clearInterval(channel.gameInfo.roundInterval);
        this.endRound(channel);
        return;
      }

      this.gameSocketService.moveBall(channel.gameInfo);
      this.server
        .to(`room:channel:${channel.channelPublic.channelId}`)
        .emit('group:game:moveBall', channel.gameInfo.ball.pos);
    }, channel.gameInfo.ball.speed);
  }

  async endGame(channel: ChannelDto) {
    if (!channel.channelPublic.onGame) return;

    channel.channelPrivate.matcher.map((user) => {
      this.changeStatus(
        this.mainSocketService.getSocketInstance(user.userId),
        'inChannel',
      );
    });

    await this.gameSocketService.endGame(channel);
    this.server
      .to(`room:channel:${channel.channelPublic.channelId}`)
      .emit('group:game:endGame', {
        waiter: channel.channelPrivate.waiter,
        matcher: channel.channelPrivate.matcher,
      });
  }

  endRound(channel: ChannelDto) {
    this.gameSocketService.endRound(channel.gameInfo);
    this.server
      .to(`room:channel:${channel.channelPublic.channelId}`)
      .emit('group:game:endRound', channel.gameInfo.matcher);
  }
}
