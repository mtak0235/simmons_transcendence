import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { from, map, Observable } from 'rxjs';
import { Inject, Logger, UseInterceptors } from '@nestjs/common';
import { InMemorySessionStore } from './in-memory-session-store';
import { InMemoryMessageStore } from './in-memory-message-store';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './user.service';
import { PersistenceInterceptor } from './persistence.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Namespace } from 'socket.io/dist/namespace';
import { Client } from 'socket.io/dist/client';
import {
  DefaultEventsMap,
  EventsMap,
  StrictEventEmitter,
} from 'socket.io/dist/typed-events';
import { SocketReservedEventsMap } from 'socket.io/dist/socket';

//#export class SocketC <ListenEvents extends EventsMap = DefaultEventsMap, EmitEvents extends EventsMap = ListenEvents, ServerSideEvents extends EventsMap = DefaultEventsMap, SocketData = any> extends Socket
export class SocketC extends Socket {
  userID: string;
  userName: string;
}
@WebSocketGateway(4000)
@UseInterceptors(PersistenceInterceptor)
export class EventsGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventGateway');
  private sessionStore = new InMemorySessionStore();
  private messageStore = new InMemoryMessageStore();
  @Inject('hello')
  private persistenceInterceptor: PersistenceInterceptor;

  constructor(private readonly userService: UserService) {}

  @UseInterceptors(PersistenceInterceptor)
  handleConnection(client: SocketC, ...args: any[]) {
    console.log('[Connected]' + client.id);
    client.userName = 'mtak';
    // persist session
    // this.sessionStore.saveSession(client.data.sessionID, {
    //   userID: client.data.userID,
    //   username: client.data.username,
    //   connected: true,
    // });
    // // emit session details
    // client.emit('session', {
    //   sessionID: client.data.sessionID,
    //   userID: client.data.userID,
    // });
    // // fetch existing users
    const users = [];
    // const messagesPerUser = new Map();
    // this.messageStore
    //   .findMessagesForUser(client.data.userID)
    //   .forEach((message) => {
    //     const { from, to } = message;
    //     const otherUser = client.data.userID === from ? to : from;
    //     if (messagesPerUser.has(otherUser)) {
    //       messagesPerUser.get(otherUser).push(message);
    //     } else {
    //       messagesPerUser.set(otherUser, [message]);
    //     }
    //   });
    // this.sessionStore.findAllSessions().forEach((session) => {
    //   users.push({
    //     userID: session.userID,
    //     username: session.username,
    //     connected: session.connected,
    //     messages: messagesPerUser.get(session.userID) || [],
    //   });
    // });
    // client.emit('users', users);

    // // notify existing users
    // client.broadcast.emit('userEnter', {
    //   userID: client.id,
    //   username: client.data.username,
    //   connected: true,
    //   message: [],
    // });
  }

  async handleDisconnect(client: SocketC) {
    console.log('disonnected', client.id);
    // const { roomId } = client.data;
    // if (
    //   roomId != 'room:lobby' &&
    //   !this.server.sockets.adapter.rooms.get(roomId)
    // ) {
    //   // this.ChatRoomService.deleteChatRoom(roomId);
    //   this.server.emit(
    //     'getChatRoomList',
    //     // this.ChatRoomService.getChatRoomList(),
    //   );
    // }
    const matchingSockets = await this.server
      .in(client.data.userID)
      .allSockets();
    console.log(matchingSockets.size);
    // console.log(matchingSockets.then((data) => data.size()));
    // const isDisconnected = matchingSockets. === 0;
    // if (isDisconnected) {
    //   // notify other users
    //   client.broadcast.emit('user disconnected', client.data.userID);
    //   // update the connection status of the session
    //   this.sessionStore.saveSession(client.data.sessionID, {
    //     userID: client.data.userID,
    //     username: client.data.username,
    //     connected: false,
    //   });
    // }
  }

  afterInit(server: SocketC): any {
    this.server.use((socket, next) => {
      // const sessionID = socket.handshake.auth.sessionID;
      // if (sessionID) {
      //   const session = this.sessionStore.findSession(sessionID);
      //   if (session) {
      //     socket.data.sessionID = sessionID;
      //     socket.data.userID = session.userID;
      //     socket.data.userName = session.userName;
      //     return next();
      //   }
      // }
      // const username = socket.handshake.auth.userName;
      // if (!username) {
      //   return next(new Error('invalid username'));
      // }
      // socket.data.sessionID = uuidv4();
      // socket.data.userID = uuidv4();
      // socket.data.username = username; //나중에intraID로 바꿔
      next();
    });
  }

  getChannelFullName(rooms: Set<string>, roomNamePrefix: RegExp) {
    for (const room of rooms) {
      if (roomNamePrefix.test(room)) {
        return room;
      }
    }
    return '';
  }

  isUserAdmin(userId) {
    return true;
  }

  @SubscribeMessage('inChannel')
  inChannel(
    @MessageBody('channelId') channelId: string,
    @ConnectedSocket() client,
  ) {
    console.log(client.userName);
    client.join('room:user:' + channelId);
    this.logger.log(client.rooms);
    this.getChannelFullName(client.rooms, /^room:user:/);
    this.server.emit('inChannel', { userId: client.id, channelId: channelId });
  }

  @SubscribeMessage('outChannel')
  outChannel(@ConnectedSocket() client: Socket) {
    client.leave(this.getChannelFullName(client.rooms, /^room:user:/));
    this.server.emit('outChannel', { userId: client.id });
  }
  //
  // // @UseInterceptors(PersistenceInterceptor)
  // @SubscribeMessage('userExit')
  // userExit(@ConnectedSocket() client: Socket) {
  //   client.rooms.clear();
  //   this.server.emit('userExit', { userId: client.id });
  // }
  //
  // // @SubscribeMessage('block')
  // // block(@MessageBody('badGuyId') badGuyId: number) {}
  //
  // @SubscribeMessage('follwow')
  // follow(
  //   @MessageBody('targetId') targetId: number,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   this.server
  //     .to(targetId.toString())
  //     .emit('friendChanged', { targetId, isFollowing: true });
  // }
  //
  // @SubscribeMessage('unfollow')
  // unfollow(@MessageBody('targetId') targetId: number) {
  //   this.server
  //     .to(targetId.toString())
  //     .emit('friendChanged', { targetId, isFollowing: false });
  // }
  //
  // @SubscribeMessage('sendMSG')
  // sendMSG(@MessageBody('msg') msg: string, @ConnectedSocket() client: Socket) {
  //   client
  //     .to(this.getChannelFullName(client.rooms, /^room:user:/))
  //     .emit('passOnMSG');
  // }
  //
  // @SubscribeMessage('sendDM')
  // sendDM(
  //   @MessageBody('recipientId') recipientTd: string,
  //   @MessageBody('msg') msg: string,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const message = {
  //     msg,
  //     from: client.data.userID,
  //     to: client.id,
  //   };
  //   client.to(recipientTd).emit('passOnDM', msg);
  //   this.messageStore.saveMessage(msg);
  // }
  //
  // @SubscribeMessage('kickOut')
  // kickOut(
  //   @MessageBody('badGuyId') badGuyId: string,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   if (this.isUserAdmin(client.id)) {
  //     return { event: 'unAuthorized' };
  //   }
  // }
  //
  // @SubscribeMessage('mute')
  // mute(
  //   @MessageBody('noisyGuyId') noisyGuyId: number,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   if (this.isUserAdmin(client.id)) {
  //     return { event: 'unAuthorized' };
  //   }
  // }
  //
  // // @SubscribeMessage('inviteUser')
  // // inviteUser(@MessageBody('invitedUserId') invitedUserId: number) {}
  //
  // @SubscribeMessage('modifyGame')
  // modifyGame(@ConnectedSocket() client: Socket) {
  //   if (this.isUserAdmin(client.id)) {
  //     return { event: 'unAuthorized' };
  //   }
  //   const channelName = this.getChannelFullName(client.rooms, /^room:user:/);
  //   // const { accessLayer, gameOption, channelId, newAdminId } =
  //   //   // getChannelInfo(channelName);
  //   // this.server.emit('gameModified', {
  //   //   channelName,
  //   //   isGameActive: true,
  //   //   accessLayer,
  //   //   gameOption,
  //   //   channelId,
  //   //   newAdminId,
  //   // });
  // }
  //
  // @SubscribeMessage('waitingGame')
  // waitingGame(@ConnectedSocket() client: Socket) {
  //   const channelName = this.getChannelFullName(client.rooms, /^room:user:/);
  //   // const waiterList = getWaiter(channelName);
  //   // if (waiterList.length >= 2) {
  //   //   this.server.to(channelName).emit('determineParticipants', {
  //   //     player: [waiterList[0], waiterList[1]],
  //   //   });
  //   // }
  // }
  //
  // @SubscribeMessage('readyGame')
  // readyGame(@ConnectedSocket() client: Socket) {
  //   const channelName = this.getChannelFullName(client.rooms, /^room:user:/);
  //   // if (isParticipantTwo(channelName)) {
  //   //   this.server.in(channelName).emit('startGame');
  //   //   return;
  //   // }
  //   client.to(channelName).emit('readyGame', client.id);
  // }
  //
  // @SubscribeMessage('endGame')
  // endGame(@ConnectedSocket() client: Socket) {
  //   return { event: 'endGame' };
  // }
  //
  // // @SubscribeMessage('generateGame')
  // // generateGame(
  // //   @MessageBody('channelName') channelName,
  // //   @MessageBody('accessLayer') accessLayer,
  // //   @MessageBody('pw') pw: number,
  // // ) {
  // //   this.server.emit('gameGenerated', { channelName, channelId, channelType });
  // // }
  // @SubscribeMessage('client2Server')
  // handleMessage(client: any) {
  //   // this.server.emit('server2Client', data);
  //   return { event: 'client2Server', data: 'Hello world!' };
  // }
  //
  // @SubscribeMessage('events')
  // findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
  //   return from([1, 2, 3]).pipe(
  //     map((item) => ({ event: 'events', data: item })),
  //   );
  // }
  //
  // @SubscribeMessage('identity')
  // async identity(@MessageBody() data: number): Promise<number> {
  //   return data;
  // }
  //
  // @SubscribeMessage('events2')
  // handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
  //   // client.emit('mtak', { msg: 'hiii' });
  //   return { room: { roomId: '', roomName: '' }, nickname: 'mtak' };
  // }
  //
  // //메시지가 전송되면 모든 유저에게 메시지 전송
  // @SubscribeMessage('sendMessage')
  // sendMessage(client: Socket, message: string): void {
  //   client.rooms.forEach((roomId) =>
  //     client.to(roomId).emit('getMessage', {
  //       id: client.id,
  //       nickname: client.data.nickname,
  //       message,
  //     }),
  //   );
  // }
  //
  // //닉네임 변경
  // @SubscribeMessage('setNickname')
  // setNickname(client: Socket, nickname: string): void {
  //   const { roomId } = client.data;
  //   client.to(roomId).emit('getMessage', {
  //     id: null,
  //     nickname: '안내',
  //     message: `"${client.data.nickname}"님이 "${nickname}"으로 닉네임을 변경하셨습니다.`,
  //   });
  //   client.data.nickname = nickname;
  // }
  //
  // //채팅방 목록 가져오기
  // @SubscribeMessage('getChatRoomList')
  // getChatRoomList(client: Socket, payload: any) {
  //   client.emit('getChatRoomList', this.userService.getChatRoomList());
  // }
  //
  // //채팅방 생성하기
  // @SubscribeMessage('createChatRoom')
  // createChatRoom(client: Socket, roomName: string) {
  //   this.userService.createChatRoom(client, roomName);
  //   return {
  //     roomId: client.data.roomId,
  //     roomName: this.userService.getChatRoom(client.data.roomId).roomName,
  //   };
  // }
  //
  // //채팅방 들어가기
  // @SubscribeMessage('enterChatRoom')
  // enterChatRoom(client: Socket, roomId: string) {
  //   //이미 접속해있는 방 일 경우 재접속 차단
  //   if (client.rooms.has(roomId)) {
  //     return;
  //   }
  //   this.userService.enterChatRoom(client, roomId);
  //   return {
  //     roomId: roomId,
  //     roomName: this.userService.getChatRoom(roomId).roomName,
  //   };
  // }
}
