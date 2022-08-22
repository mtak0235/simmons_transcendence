// import { Injectable } from '@nestjs/common';
// import { UserSocketStore } from '@socket/storage/user.socket.store';
// // import { MessageStore } from '@socket/storage/message-store';
// import { Client } from '@socket/socket.gateway';
// import {
//   ACCESS_LAYER,
//   ChannelInfoDto,
//   ChannelSocketStore,
// } from '@socket/storage/channel.socket.store';
// import { Server } from 'socket.io';
//
// @Injectable()
// export class SocketService {
//   constructor(
//     private sessionStore: UserSocketStore,
//     // private messageStore: MessageStore,
//     private channelListStore: ChannelSocketStore,
//   ) {}
//
//   getChannelFullName(rooms: Set<string>, roomNamePrefix: RegExp) {
//     const ret = new Array<string>();
//     for (const room of rooms) {
//       if (roomNamePrefix.test(room)) {
//         ret.push(room);
//       }
//     }
//     return ret;
//   }
//
//   getUserID(encryptedUserID: string) {
//     // encryptedUserID => userID 빼는 로직
//     return encryptedUserID;
//   }
//
//   // findSession(userID: string): Session {
//   //   return this.sessionStore.findSession(userID);
//   // }
//
//   getUserName(userID: string): string {
//     // db에서 username 가져와야됨.
//     return userID + 'NAME';
//   }
//
//   // saveSession(userID: string, session: Session) {
//   //   this.sessionStore.saveSession(userID, session);
//   // }
//
//   getBlockList(userID: any): Array<string> {
//     return [];
//   }
//
//   getMessageForUser(client) {
//     const messagesPerUser = new Map();
//     const stackedMsg = [];
//     // this.messageStore.findMessagesForUser(client.userID).forEach((message) => {
//     //   const { from, to } = message;
//     //   const otherUser = client.userID === from ? to : from;
//     //   if (messagesPerUser.has(otherUser)) {
//     //     messagesPerUser.get(otherUser).push(message);
//     //   } else {
//     //     messagesPerUser.set(otherUser, [message]);
//     //   }
//     // });
//     this.sessionStore.findAll().forEach((session) => {
//       stackedMsg.push({
//         userID: session.userId,
//         username: session.username,
//         connected: session.status,
//         messages: messagesPerUser.get(session.userId) || [],
//       });
//     });
//     client.emit('getPreLogs', stackedMsg);
//     // notify existing users
//     client.broadcast.emit('userEnter', {
//       userId: client.userId,
//       username: client.username,
//       connected: true,
//     });
//   }
//
//   enterChannel(client, channelId) {
//     const channelName = 'room:user:' + channelId;
//     if (!client.rooms.has(channelName)) {
//       this.getChannelFullName(client.rooms, /^room:user:/).forEach(
//         (roomName) => {
//           client.leave(roomName);
//         },
//       );
//       client.join(channelName);
//       client.broadcast
//         .except(channelName)
//         .emit('userEnteredServer', { userId: client.userId, channelName });
//       client
//         .to(channelName)
//         .emit('getMessage', `${client.username}님이 입장하셨습니다.`);
//     }
//   }
//
//   block(badGuyID: number, userId: number) {
//     //reposiory에서 (userId, badGuyID) 저장하기
//   }
//
//   friendChanged(param: {
//     isFollowing: boolean;
//     targetID: number;
//     userId: number;
//   }) {
//     //repository에 { userId:client.userId,targetID, isFollowing: true } 저장하기
//   }
//
//   saveMessage(msg: string) {
//     // this.messageStore.saveMessage(msg);
//   }
//
//   kickOut(client: Client, badGuyID: number, server: Server) {
//     this.getChannelFullName(client.rooms, /^room:user:/).forEach(
//       (channelName) => {
//         const channelInfoDto = this.channelListStore.findChannel(channelName);
//         if (channelInfoDto.channel.adminId == client.user.userId) {
//           server.in(badGuyID.toString()).socketsLeave(channelName);
//           server
//             .in(badGuyID.toString())
//             .emit('expelled', `you are expelled from ${channelName}`);
//         }
//       },
//     );
//   }
//
//   modifyGame(client: Client, channelInfo: ChannelInfoDto) {
//     this.getChannelFullName(client.rooms, /^room:user:/).forEach(
//       (channelName) => {
//         const channelInfoDto = this.channelListStore.findChannel(channelName);
//         if (channelInfoDto.channel.adminId == client.user.userId) {
//           if (channelInfo.password) {
//             delete channelInfoDto.password;
//             channelInfoDto.password = channelInfo.password;
//           }
//           delete channelInfoDto.channel;
//           channelInfoDto.channel = channelInfo.channel;
//           client.broadcast.emit('gameModified', channelInfoDto.channel);
//         }
//       },
//     );
//   }
//
//   inviteUser(client: Client, invitedUserId: number, server: Server) {
//     this.getChannelFullName(client.rooms, /^room:user:/).forEach(
//       (channelName) => {
//         const channelDto = this.channelListStore.findChannel(channelName);
//         client.to(invitedUserId.toString()).emit('getInvitation', {
//           msg: `you are invited to ${client.user.username}.`,
//           inviter: client.user.userId,
//           channelDto,
//         });
//       },
//     );
//   }
//
//   mute(client: Client, noisyGuyId: number) {
//     this.getChannelFullName(client.rooms, /^room:user:/).forEach(
//       (channelName) => {
//         const channelInfoDto = this.channelListStore.findChannel(channelName);
//         if (channelInfoDto.channel.adminId == client.user.userId) {
//           client.to(noisyGuyId.toString()).emit('muted');
//         } else {
//           client.emit('unAuthorized', "you aren't authorized");
//         }
//       },
//     );
//   }
//
//   createChannel(client: Client, channelInfoDto: ChannelInfoDto) {
//     const channelName = 'room:user:' + client.user.userId;
//     if (this.channelListStore.findChannel(channelName)) {
//       throw new Error('duplicate Exception');
//     }
//     this.channelListStore.createChannel(channelName, channelInfoDto);
//     this.enterChannel(client, client.user.userId);
//     if (!client.rooms.has(channelName)) {
//       this.getChannelFullName(client.rooms, /^room:user:/).forEach(
//         (roomName) => {
//           client.leave(roomName);
//         },
//       );
//       client.join(channelName);
//       if (channelInfoDto.channel.accessLayer != ACCESS_LAYER.PRIVATE) {
//         client.broadcast.emit('gameGenerated', channelInfoDto.channel);
//       }
//     }
//   }
//
//   saveGameResult(gameResult: { winner: number; loser: number; score: number }) {
//     //game result 저장
//   }
//
//   reserveGame(client: Client) {
//     this.getChannelFullName(client.rooms, /^room:user:/).forEach(
//       (channelName) => {
//         const channelInfoDto = this.channelListStore.findChannel(channelName);
//         channelInfoDto.waiter.push(client.user.userId);
//         if (channelInfoDto.waiter.length < 2) {
//           client
//             .to(channelName)
//             .emit('waitingGame', { waiter: client.user.userId });
//           return;
//         }
//         for (let i = 0; i < 2; i++) {
//           // channelInfoDto.matcher.set(channelInfoDto.waiter.shift(), false);
//         }
//         // client.broadcast
//         //   .except(
//         //       matcher.map(data => data.userId.toString())
//         //     ),
//         //   )
//         //   .emit('matcherMade', channelInfoDto);
//       },
//     );
//   }
//
//   readyGame(client: Client, server: Server) {
//     this.getChannelFullName(client.rooms, /^room:user:/).forEach(
//       (channelName) => {
//         const channelInfoDto = this.channelListStore.findChannel(channelName);
//         if (
//           Array.from(channelInfoDto.matcher.values()).filter(
//             (matcher) => matcher.isReady === false,
//           ).length
//         ) {
//           client.in(channelName).emit('readyGame', client.user.userId);
//         }
//         client.in(channelName).emit('startGame');
//       },
//     );
//   }
// }
