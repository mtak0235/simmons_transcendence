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
import {Server, Socket} from 'socket.io';
import {BadRequestException, Logger, UseInterceptors} from '@nestjs/common';
import {EventInterceptor} from '@src/event/event.interceptor';
import {EventService} from '@src/event/event.service';
import {Session} from '@src/event/storage/session-store';
import {channel} from "diagnostics_channel";

export class SocketC extends Socket {
    userID: number;
    userName: string;
}

@WebSocketGateway(4000)
export class EventGateway
    implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private logger: Logger = new Logger('EventGateway');

    // @Inject('hello')
    // private eventInterceptor: EventInterceptor;
    constructor(private readonly eventService: EventService) {
    }

    @UseInterceptors(EventInterceptor)
    afterInit(server: any): any {
        server.use((client, next) => {
            const encryptedUserID = client.handshake.auth.encryptedUserID;
            if (!encryptedUserID) {
                throw new BadRequestException('jwt 가지고 오셈');
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
        this.eventService.getMessageForUser(client);
    }

    async handleDisconnect(client: SocketC, ...args: any[]): Promise<any> {
        const sockets = this.server.in(client.userID.toString()).allSockets();
        if ((await sockets.then((data) => data.size)) == 0) {
            client.broadcast.emit('userExit', client.userID);
            const session: Session = {
                userID: client.userID,
                userName: client.userName,
                connected: false,
            };
            this.eventService.saveSession(client.userID.toString(), session);
        }
    }

    isUserAdmin(userId) {
        return true;
    }

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
                    client.to(channelName).emit('getMessage', `${client.userName}님이 퇴장하셨습니다.`);
                    client.leave(channelName);
                }
            );
        client.broadcast.emit('outChannel', client.userID);
    }

    @SubscribeMessage('block')
    block(@MessageBody('badGuyID') badGuyID: number, @ConnectedSocket() client: SocketC) {
        this.eventService.block(badGuyID, client.userID);
    }

    @SubscribeMessage('follow')
    follow(
        @MessageBody('targetID') targetID: number,
        @ConnectedSocket() client: SocketC,
    ) {
        this.eventService.friendChanged({userID: client.userID, targetID, isFollowing: true});
        this.server
            .to(targetID.toString())
            .to(client.userID.toString())
            .emit('friendChanged', {userID: client.userID, targetID, isFollowing: true});
    }

    @SubscribeMessage('unfollow')
    unfollow(@MessageBody('targetID') targetID: number, @ConnectedSocket() client: SocketC) {
        this.eventService.friendChanged({userID: client.userID, targetID, isFollowing: false});
        this.server
            .to(targetID.toString())
            .emit('friendChanged', {userID: client.userID, targetID, isFollowing: false});
    }

    @SubscribeMessage('sendMSG')
    sendMSG(@MessageBody('msg') msg: string, @ConnectedSocket() client: SocketC) {
        client
            .to(this.eventService.getChannelFullName(client.rooms, /^room:user:/))
            .emit('getMSG', {userID: client.userID, userName: client.userName, msg});
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
            .emit('getDM', {userID: client.userID, userName: client.userName, msg});
    }

    @SubscribeMessage('kickOut')
    kickOut(
      @MessageBody('badGuyID') badGuyID: string,
      @ConnectedSocket() client: SocketC,
    ) {
        this.eventService.kickOut(client, badGuyID);
      if (this.isUserAdmin(client.id)) {
        return { event: 'unAuthorized' };
      }
    }

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
