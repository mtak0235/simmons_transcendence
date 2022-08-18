import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  BadRequestException,
  Inject,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import { EventInterceptor } from '@src/event/event.interceptor';
import { EventService } from '@src/event/event.service';
import { Session } from '@src/event/storage/user.store';
import { ChannelInfoDto } from '@src/event/storage/channelStore';

export class SocketC extends Socket {
  userID: number;
  userName: string;
}

@WebSocketGateway(4000)
export class EventGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('EventGateway');

  @Inject('eventInterceptor')
  private eventInterceptor: EventInterceptor;
  constructor(private readonly eventService: EventService) {}

  afterInit(server: any): any {
    server.use((client, next) => {
      const encryptedUserID = client.handshake.auth.encryptedUserID;
      if (!encryptedUserID) {
        // throw new BadRequestException('jwt 가지고 오셈');
      }
      const userID = this.eventService.getUserID(encryptedUserID);
      const session = this.eventService.findSession(userID);
      if (!session) {
        this.eventService.getUserName(userID);
        this.eventService.saveSession(userID, session);
        client.join(userID);
      }
      client.userID = userID;
      next();
    });
  }

  handleConnection(client: SocketC, ...args: any[]): any {
    const blockList = this.eventService.getBlockList(client.userID);
    client.emit('getBlockList', blockList);
    // this.eventService.getMessageForUser(client);
  }

  // async handleDisconnect(client: SocketC, ...args: any[]): Promise<any> {
  //   const sockets = this.server.in(client.userID.toString()).allSockets();
  //   if ((await sockets.then((data) => data.size)) == 0) {
  //     client.broadcast.emit('userExit', client.userID);
  //     const session: Session = {
  //       userID: client.userID,
  //       userName: client.userName,
  //       connected: false,
  //     };
  //     this.eventService.saveSession(client.userID.toString(), session);
  //   }
  // }
  @SubscribeMessage('inChannel')
  inChannel(
    @MessageBody('channelId')
    channelId: string,
    @ConnectedSocket()
    client,
  ) {
    this.eventService.enterChannel(client, channelId);
  }

  @SubscribeMessage('outChannel')
  outChannel(
    @ConnectedSocket()
    client: SocketC,
  ) {
    this.eventService
      .getChannelFullName(client.rooms, /^room:user:/)
      .forEach((channelName) => {
        client
          .to(channelName)
          .emit('getMessage', `${client.userName}님이 퇴장하셨습니다.`);
        client.leave(channelName);
      });
    client.broadcast.emit('outChannel', client.userID);
  }

  @SubscribeMessage('block')
  block(
    @MessageBody('badGuyID') badGuyID: number,
    @ConnectedSocket() client: SocketC,
  ) {
    this.eventService.block(badGuyID, client.userID);
  }

  @SubscribeMessage('follow')
  follow(
    @MessageBody('targetID') targetID: number,
    @ConnectedSocket() client: SocketC,
  ) {
    this.eventService.friendChanged({
      userID: client.userID,
      targetID,
      isFollowing: true,
    });
    this.server
      .to(targetID.toString())
      .to(client.userID.toString())
      .emit('friendChanged', {
        userID: client.userID,
        targetID,
        isFollowing: true,
      });
  }

  @SubscribeMessage('unfollow')
  unfollow(
    @MessageBody('targetID') targetID: number,
    @ConnectedSocket() client: SocketC,
  ) {
    this.eventService.friendChanged({
      userID: client.userID,
      targetID,
      isFollowing: false,
    });
    this.server.to(targetID.toString()).emit('friendChanged', {
      userID: client.userID,
      targetID,
      isFollowing: false,
    });
  }

  @SubscribeMessage('sendMSG')
  sendMSG(@MessageBody('msg') msg: string, @ConnectedSocket() client: SocketC) {
    client
      .to(this.eventService.getChannelFullName(client.rooms, /^room:user:/))
      .emit('getMSG', {
        userID: client.userID,
        userName: client.userName,
        msg,
      });
  }

  @SubscribeMessage('sendDM')
  sendDM(
    @MessageBody('recipientId') recipientTd: string,
    @MessageBody('msg') msg: string,
    @ConnectedSocket() client: SocketC,
  ) {
    this.eventService.saveMessage(msg);
    client
      .to(this.eventService.getChannelFullName(client.rooms, /^room:user:/))
      .emit('getDM', { userID: client.userID, userName: client.userName, msg });
  }

  @SubscribeMessage('kickOut')
  kickOut(client: SocketC, badGuyID: number) {
    this.eventService.kickOut(client, badGuyID, this.server);
  }

  @SubscribeMessage('modifyGame')
  modifyGame(
    @ConnectedSocket() client: SocketC,
    @MessageBody() channelInfo: ChannelInfoDto,
  ) {
    this.eventService.modifyGame(client, channelInfo);
  }

  @SubscribeMessage('inviteUser')
  inviteUser(
    @MessageBody('invitedUserId') invitedUserId: number,
    @ConnectedSocket() client: SocketC,
  ) {
    this.eventService.inviteUser(client, invitedUserId, this.server);
  }

  @SubscribeMessage('mute')
  mute(
    @MessageBody('noisyGuyId') noisyGuyId: number,
    @ConnectedSocket() client: SocketC,
  ) {
    this.eventService.mute(client, noisyGuyId);
  }

  @SubscribeMessage('generateGame')
  generateGame(
    @ConnectedSocket() client: SocketC,
    @MessageBody() channelInfoDto: ChannelInfoDto,
  ) {
    this.eventService.createChannel(client, channelInfoDto);
  }

  @SubscribeMessage('endGame')
  endGame(
    @ConnectedSocket() client: SocketC,
    @MessageBody('score')
    gameResult: { winner: number; loser: number; score: number },
  ) {
    this.eventService.saveGameResult(gameResult);
    return { event: 'endGame', data: gameResult };
  }

  @SubscribeMessage('waitingGame')
  waitingGame(@ConnectedSocket() client: SocketC) {
    this.eventService.reserveGame(client);
  }

  @SubscribeMessage('readyGame')
  readyGame(client: SocketC) {
    this.eventService.readyGame(client, this.server);
  }

  // @SubscribeMessage('client2Server')
  // handleMessage(client: any) {
  //   // this.server.emit('server2Client', data);
  //   return { event: 'client2Server', data: 'Hello world!' };
  // }
  // @SubscribeMessage('events')
  // findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
  //   return from([1, 2, 3]).pipe(
  //     map((item) => ({ event: 'events', data: item })),
  //   );
  // }
}
