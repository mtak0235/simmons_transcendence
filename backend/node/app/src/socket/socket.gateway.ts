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
  private logger: Logger = new Logger('SocketGateway');

  @Inject('socketInterceptor')
  private eventInterceptor: SocketInterceptor;
  constructor(
    // private readonly socketService: SocketService,
    private readonly mainSocketService: MainSocketService,
    private readonly userSocketService: UserSocketService,
    private readonly channelSocketService: ChannelSocketService,
    private readonly userSocketStore: UserSocketStore, // todo: delete: store 접근은 service layer에서 해야함
  ) {}

  /* ============================================= */
  /*              Handling Connection              */
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

  // @SubscribeMessage('inChannel')
  // inChannel(
  //   @MessageBody('channelId')
  //   channelId: string,
  //   @ConnectedSocket()
  //   client,
  // ) {
  //   this.socketService.enterChannel(client, channelId);
  // }
  //
  // @SubscribeMessage('outChannel')
  // outChannel(
  //   @ConnectedSocket()
  //   client: Client,
  // ) {
  //   this.socketService
  //     .getChannelFullName(client.rooms, /^room:user:/)
  //     .forEach((channelName) => {
  //       client
  //         .to(channelName)
  //         .emit('getMessage', `${client.user.username}님이 퇴장하셨습니다.`);
  //       client.leave(channelName);
  //     });
  //   client.broadcast.emit('outChannel', client.user.userId);
  // }
  //
  // @SubscribeMessage('block')
  // block(
  //   @MessageBody('badGuyID') badGuyID: number,
  //   @ConnectedSocket() client: Client,
  // ) {
  //   this.socketService.block(badGuyID, client.user.userId);
  // }
  //
  // @SubscribeMessage('follow')
  // follow(
  //   @MessageBody('targetID') targetID: number,
  //   @ConnectedSocket() client: Client,
  // ) {
  //   this.socketService.friendChanged({
  //     userId: client.user.userId,
  //     targetID,
  //     isFollowing: true,
  //   });
  //   this.server
  //     .to(targetID.toString())
  //     .to(client.user.userId.toString())
  //     .emit('friendChanged', {
  //       userId: client.user.userId,
  //       targetID,
  //       isFollowing: true,
  //     });
  // }
  //
  // @SubscribeMessage('unfollow')
  // unfollow(
  //   @MessageBody('targetID') targetID: number,
  //   @ConnectedSocket() client: Client,
  // ) {
  //   this.socketService.friendChanged({
  //     userId: client.user.userId,
  //     targetID,
  //     isFollowing: false,
  //   });
  //   this.server.to(targetID.toString()).emit('friendChanged', {
  //     userId: client.user.userId,
  //     targetID,
  //     isFollowing: false,
  //   });
  // }
  //
  // @SubscribeMessage('sendMSG')
  // sendMSG(@MessageBody('msg') msg: string, @ConnectedSocket() client: Client) {
  //   client
  //     .to(this.socketService.getChannelFullName(client.rooms, /^room:user:/))
  //     .emit('getMSG', {
  //       userId: client.user.userId,
  //       username: client.user.username,
  //       msg,
  //     });
  // }
  //
  // @SubscribeMessage('sendDM')
  // sendDM(
  //   @MessageBody('recipientId') recipientTd: string,
  //   @MessageBody('msg') msg: string,
  //   @ConnectedSocket() client: Client,
  // ) {
  //   this.socketService.saveMessage(msg);
  //   client
  //     .to(this.socketService.getChannelFullName(client.rooms, /^room:user:/))
  //     .emit('getDM', {
  //       userId: client.user.userId,
  //       username: client.user.username,
  //       msg,
  //     });
  // }
  //
  // @SubscribeMessage('kickOut')
  // kickOut(client: Client, badGuyID: number) {
  //   this.socketService.kickOut(client, badGuyID, this.server);
  //   this.outChannel(client);
  // }
  //
  // @SubscribeMessage('modifyGame')
  // modifyGame(
  //   @ConnectedSocket() client: Client,
  //   @MessageBody() channelInfo: ChannelInfoDto,
  // ) {
  //   this.socketService.modifyGame(client, channelInfo);
  // }
  //
  // @SubscribeMessage('inviteUser')
  // inviteUser(
  //   @MessageBody('invitedUserId') invitedUserId: number,
  //   @ConnectedSocket() client: Client,
  // ) {
  //   this.socketService.inviteUser(client, invitedUserId, this.server);
  // }
  //
  // @SubscribeMessage('mute')
  // mute(
  //   @MessageBody('noisyGuyId') noisyGuyId: number,
  //   @ConnectedSocket() client: Client,
  // ) {
  //   this.socketService.mute(client, noisyGuyId);
  // }
  //
  // @SubscribeMessage('generateGame')
  // generateGame(
  //   @ConnectedSocket() client: Client,
  //   @MessageBody() channelInfoDto: ChannelInfoDto,
  // ) {
  //   this.socketService.createChannel(client, channelInfoDto);
  // }
  //
  // @SubscribeMessage('endGame')
  // endGame(
  //   @ConnectedSocket() client: Client,
  //   @MessageBody('score')
  //   gameResult: { winner: number; loser: number; score: number },
  // ) {
  //   this.socketService.saveGameResult(gameResult);
  //   return { event: 'endGame', data: gameResult };
  // }
  //
  // @SubscribeMessage('waitingGame')
  // waitingGame(@ConnectedSocket() client: Client) {
  //   this.socketService.reserveGame(client);
  // }
  //
  // @SubscribeMessage('readyGame')
  // readyGame(client: Client) {
  //   this.socketService.readyGame(client, this.server);
  // }

  // @SubscribeMessage('client2Server')
  // handleMessage(client: any) {
  //   // this.server.emit('server2Client', data);
  //   return { socket: 'client2Server', data: 'Hello world!' };
  // }
  // @SubscribeMessage('events')
  // findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
  //   return from([1, 2, 3]).pipe(
  //     map((item) => ({ socket: 'events', data: item })),
  //   );
  // }
}
