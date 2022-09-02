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
import {
  ChannelInterceptor,
  ChannelMessageInterceptor,
} from '@socket/interceptor/channel.socket.interceptor';
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
      client.emit('single:user:connected', mainPageDto);
      client.broadcast.emit('broad:user:connected', {
        userId: client.user.userId,
        username: client.user.username,
        status: client.user.status,
      });
    } catch (err) {
      // todo: 예외 분기 정확히 작성해야 함
      if (err instanceof SocketException) client.emit('error', err);
      else
        client.emit('single:user:error', {
          error: 'server',
          message: 'unKnown',
        });
      client.disconnect();
    }
  }

  async handleDisconnect(client: ClientInstance): Promise<any> {
    if (client.user) {
      // todo: service 로 빼야함
      if (client.channel) this.outChannel(client);

      this.userSocketService.switchStatus(client.user, 'offline');

      client.broadcast.emit('broad:user:disconnected', {
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

    client.join(`room:channel:${client.channel.channelPublic.channelIdx}`);
    client.emit('single:channel:createChannel', {
      channelPublic: client.channel.channelPublic,
      channelPrivate: client.channel.channelPrivate,
    });
    client.broadcast.emit(
      'broad:channel:createdChannel',
      client.channel.channelPublic,
    );
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

    this.server.emit(
      'broad:channel:updateChannel',
      client.channel.channelPublic,
    );
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

    client.join(`room:channel:${client.channel.channelPublic.channelIdx}`);
    client.emit('single:channel:inChannel', client.channel.channelPrivate);
    client
      .to(`room:channel:${client.channel.channelPublic.channelIdx}`)
      .emit('group:channel:inChannel', client.user.userId);
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

    client.leave(`room:channel:${client.channel.channelPublic.channelIdx}`);
    client.emit('single:channel:outChannel', {
      channelId: client.channel.channelPublic.channelIdx,
    });

    if (channelStatus.userExist) {
      if (channelStatus.ownerChange || channelStatus.adminChange)
        this.server.emit('broad:channel:setAdmin', {
          channelId: client.channel.channelPublic.channelIdx,
          ownerId: client.channel.channelPublic.ownerId,
          adminId: client.channel.channelPublic.adminId,
        });

      client
        .to(`room:channel:${client.channel.channelPublic.channelIdx}`)
        .emit('group:channel:outChannel', client.user.userId);
    } else {
      this.server.emit(
        'broad:channel:deleteChannel',
        client.channel.channelPublic.channelIdx,
      );
      this.channelSocketService.deleteChannel(
        client.channel.channelPublic.channelIdx,
      );
    }

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

    client.to(`room:user:${userId}`).emit('single:channel:inviteUser', {
      channelId: client.channel.channelPublic.channelIdx,
      channelName: client.channel.channelPublic.channelName,
    });
  }

  @UseInterceptors(
    new ChannelInterceptor(true, false, true),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('setAdmin')
  setAdmin(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('userId', ParseIntPipe) userId: number,
  ) {
    this.channelSocketService.setAdmin(client.channel, userId);

    this.server.emit('broad:channel:setAdmin', {
      channelId: client.channel.channelPublic.channelIdx,
      ownerId: client.channel.channelPublic.ownerId,
      adminId: client.channel.channelPublic.adminId,
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

    client.to(`room:user:${userId}`).emit('single:channel:kickOut');
    client
      .to(`room:channel:${client.channel.channelPublic.channelIdx}`)
      .emit('group:channel:kickOut', { userId });
  }

  @UseInterceptors(
    new ChannelInterceptor(true, true),
    new SocketBodyCheckInterceptor('mutedUser'),
  )
  @SubscribeMessage('muteUser')
  muteUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('muteUser') muteUser: MutedUser,
  ) {
    this.channelSocketService.mutedUser(client.channel, muteUser);

    this.server
      .to(`room:channel:${client.channel.channelPublic.channelIdx}`)
      .emit('group:channel:muteUser', { muteUser });
  }

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('waitingGame')
  waitingGame(@ConnectedSocket() client: ClientInstance) {
    this.channelSocketService.waitingGame(client.channel, client.user.userId);

    this.server
      .to(`room:channel:${client.channel.channelPublic.channelIdx}`)
      .emit('group:channel:getGameParticipants', {
        matcher: client.channel.channelPrivate.matcher,
        waiter: client.channel.channelPrivate.waiter,
      });
  }

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('readyGame')
  readyGame(@ConnectedSocket() client: ClientInstance) {
    const readyCount = this.channelSocketService.readyGame(
      client.channel,
      client.user.userId,
    );

    if (readyCount !== 2) {
      this.server
        .to(`room:channel:${client.channel.channelPublic.channelIdx}`)
        .emit('group:channel:readyGame', {
          matcher: client.channel.channelPrivate.matcher,
        });
      return;
    }
    this.server
      .to(`room:channel:${client.channel.channelPublic.channelIdx}`)
      .emit('group:channel:startGame', {
        matcher: client.channel.channelPrivate.matcher,
        score: client.channel.channelPublic.score,
      });
  }

  // todo: 어떻게 처리할지 생각 해봐야함
  @UseInterceptors(
    new ChannelInterceptor(true, false),
    new SocketBodyCheckInterceptor('userId'),
  )
  @SubscribeMessage('endGame')
  endGame(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('result', ParseIntPipe) result?: number,
  ) {
    this.channelSocketService.endGame(client.channel, result).then(() => {
      this.server
        .in(`room:channel:${client.channel.channelPublic.channelIdx}`)
        .emit('gameOver', {
          waiter: client.channel.channelPrivate.waiter,
          matcher: client.channel.channelPrivate.matcher,
        });
    });
  }

  //todo: intereceptor에 mute되었는지 검사 필요.
  @UseInterceptors(
    new ChannelInterceptor(true, false),
    ChannelMessageInterceptor,
    new SocketBodyCheckInterceptor('message'),
  )
  @SubscribeMessage('sendMsg')
  sendMSG(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('message') message: string,
  ) {
    this.server
      .to(`room:channel:${client.channel.channelPublic.channelIdx}`)
      .emit('group:channel:sendMsg', {
        sourceId: client.user.userId,
        message: message,
      })
  }
  //todo: interceptor에서 block 확인

  @UseInterceptors(
    new ChannelInterceptor(true, false),
    ChannelMessageInterceptor,
    new SocketBodyCheckInterceptor('targetId', 'message'),
  )
  @SubscribeMessage('sendDm')
  async sendDM(
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

  @UseInterceptors(new SocketBodyCheckInterceptor('targetId'))
  @SubscribeMessage('blockUser')
  async blockUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId', ParseIntPipe) targetId: number,
  ) {
    this.userSocketService.block(client.user, targetId).then();

    if (client.user.follows.indexOf(targetId))
      await this.unfollowUser(client, targetId);

    client.emit('single:user:blockUser', { targetId });
  }

  @UseInterceptors(new SocketBodyCheckInterceptor('targetId'))
  @SubscribeMessage('followUser')
  async followUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId', ParseIntPipe) targetId: number,
  ) {
    await this.userSocketService.follow(client.user, targetId);

    client.emit('single:user:followUser', {
      sourceId: client.user.userId,
      targetId,
    });

    client.to(`room:user:${targetId}`).emit('followedUser', {
      sourceId: client.user.userId,
      targetId,
    });
  }

  @UseInterceptors(new SocketBodyCheckInterceptor('targetId'))
  @SubscribeMessage('unfollowUser')
  async unfollowUser(
    @ConnectedSocket() client: ClientInstance,
    @MessageBody('targetId', ParseIntPipe) targetId: number,
  ) {
    await this.userSocketService.unfollow(client.user, targetId);

    client.emit('single:user:unfollowUser', {
      sourceId: client.user.userId,
      targetId,
    });
  }
}
