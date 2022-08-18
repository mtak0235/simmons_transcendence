import { Injectable } from '@nestjs/common';
import { Session, SessionStore } from '@src/event/storage/session-store';
import { MessageStore } from '@src/event/storage/message-store';
import { SocketC } from '@src/event/event.gateway';
import {
  ACCESS_LAYER,
  ChannelInfoDto,
  ChannelListStore,
} from '@src/event/storage/channel-list-store';
import { Server } from 'socket.io';
import { channel } from 'diagnostics_channel';

@Injectable()
export class EventService {
  constructor(
    private sessionStore: SessionStore,
    private messageStore: MessageStore,
    private channelListStore: ChannelListStore,
  ) {}

  getChannelFullName(rooms: Set<string>, roomNamePrefix: RegExp) {
    const ret = new Array<string>();
    for (const room of rooms) {
      if (roomNamePrefix.test(room)) {
        ret.push(room);
      }
    }
    return ret;
  }

  getUserID(encryptedUserID: string) {
    // encryptedUserID => userID 빼는 로직
    return encryptedUserID;
  }

  findSession(userID: string): Session {
    return this.sessionStore.findSession(userID);
  }

  getUserName(userID: string): string {
    // db에서 userName 가져와야됨.
    return userID + 'NAME';
  }

  saveSession(userID: string, session: Session) {
    this.sessionStore.saveSession(userID, session);
  }

  getBlockList(userID: any): Array<string> {
    return [];
  }

  getMessageForUser(client) {
    const messagesPerUser = new Map();
    const stackedMsg = [];
    this.messageStore.findMessagesForUser(client.userID).forEach((message) => {
      const { from, to } = message;
      const otherUser = client.userID === from ? to : from;
      if (messagesPerUser.has(otherUser)) {
        messagesPerUser.get(otherUser).push(message);
      } else {
        messagesPerUser.set(otherUser, [message]);
      }
    });
    this.sessionStore.findAllSessions().forEach((session) => {
      stackedMsg.push({
        userID: session.userID,
        userName: session.userName,
        connected: session.status,
        messages: messagesPerUser.get(session.userID) || [],
      });
    });
    client.emit('getPreLogs', stackedMsg);
    // notify existing users
    client.broadcast.emit('userEnter', {
      userID: client.userID,
      userName: client.userName,
      connected: true,
    });
  }

  enterChannel(client, channelId) {
    const channelName = 'room:user:' + channelId;
    if (!client.rooms.has(channelName)) {
      this.getChannelFullName(client.rooms, /^room:user:/).forEach(
        (roomName) => {
          client.leave(roomName);
        },
      );
      client.join(channelName);
      client.broadcast
        .except(channelName)
        .emit('userEnteredServer', { userID: client.userID, channelName });
      client
        .to(channelName)
        .emit('getMessage', `${client.userName}님이 입장하셨습니다.`);
    }
  }

  block(badGuyID: number, userID: number) {
    //reposiory에서 (userID, badGuyID) 저장하기
  }

  friendChanged(param: {
    isFollowing: boolean;
    targetID: number;
    userID: number;
  }) {
    //repository에 { userID:client.userID,targetID, isFollowing: true } 저장하기
  }

  saveMessage(msg: string) {
    this.messageStore.saveMessage(msg);
  }

  kickOut(client: SocketC, badGuyID: number, server: Server) {
    this.getChannelFullName(client.rooms, /^room:user:/).forEach(
      (channelName) => {
        const channelInfoDto = this.channelListStore.findChannel(channelName);
        if (channelInfoDto.channel.adminID == client.userID) {
          server.in(badGuyID.toString()).socketsLeave(channelName);
          server
            .in(badGuyID.toString())
            .emit('expelled', `you are expelled from ${channelName}`);
        }
      },
    );
  }

  modifyGame(client: SocketC, channelInfo: ChannelInfoDto) {
    this.getChannelFullName(client.rooms, /^room:user:/).forEach(
      (channelName) => {
        const channelInfoDto = this.channelListStore.findChannel(channelName);
        if (channelInfoDto.channel.adminID == client.userID) {
          if (channelInfo.password) {
            delete channelInfoDto.password;
            channelInfoDto.password = channelInfo.password;
          }
          delete channelInfoDto.channel;
          channelInfoDto.channel = channelInfo.channel;
          client.broadcast.emit('gameModified', channelInfoDto.channel);
        }
      },
    );
  }

  inviteUser(client: SocketC, invitedUserId: number, server: Server) {
    const channelName = 'room:user:' + client.userID;
    const channelDto = this.channelListStore.createChannel(channelName, {
      waiter: undefined,
      matcher: undefined,
      channel: {
        accessLayer: ACCESS_LAYER.PRIVATE,
        channelName,
        score: 10,
        adminID: client.userID,
      },
      password: undefined,
    });
    server.in(invitedUserId.toString()).socketsJoin(channelName);
    client.to(invitedUserId.toString()).emit('getInvitation', {
      msg: `you are invited to ${client.userName}.`,
      channelDto,
    });
  }

  mute(client: SocketC, noisyGuyId: number) {
    this.getChannelFullName(client.rooms, /^room:user:/).forEach(
      (channelName) => {
        const channelInfoDto = this.channelListStore.findChannel(channelName);
        if (channelInfoDto.channel.adminID == client.userID) {
          client.to(noisyGuyId.toString()).emit('muted');
        } else {
          client.emit('unAuthorized', "you aren't authorized");
        }
      },
    );
  }

  createChannel(client: SocketC, channelInfoDto: ChannelInfoDto) {
    const channelName = 'room:user:' + client.userID;
    if (this.channelListStore.findChannel(channelName)) {
      throw new Error('duplicate Exception');
    }
    this.channelListStore.createChannel(channelName, channelInfoDto);
    this.enterChannel(client, client.userID);
    if (!client.rooms.has(channelName)) {
      this.getChannelFullName(client.rooms, /^room:user:/).forEach(
        (roomName) => {
          client.leave(roomName);
        },
      );
      client.join(channelName);
      if (channelInfoDto.channel.accessLayer != ACCESS_LAYER.PRIVATE) {
        client.broadcast.emit('gameGenerated', channelInfoDto.channel);
      }
    }
  }

  saveGameResult(gameResult: { winner: number; loser: number; score: number }) {
    //game result 저장
  }

  reserveGame(client: SocketC) {
    this.getChannelFullName(client.rooms, /^room:user:/).forEach(
      (channelName) => {
        const channelInfoDto = this.channelListStore.findChannel(channelName);
        channelInfoDto.waiter.push(client.userID);
        if (channelInfoDto.waiter.length < 2) {
          client.to(channelName).emit('waitingGame', { waiter: client.userID });
          return;
        }
        for (let i = 0; i < 2; i++) {
          channelInfoDto.matcher.set(channelInfoDto.waiter.shift(), false);
        }
        client.broadcast
          .except(
            Array.from(channelInfoDto.matcher.keys()).map((data) =>
              data.toString(),
            ),
          )
          .emit('matcherMade', channelInfoDto);
      },
    );
  }

  readyGame(client: SocketC, server: Server) {
    this.getChannelFullName(client.rooms, /^room:user:/).forEach(
      (channelName) => {
        const channelInfoDto = this.channelListStore.findChannel(channelName);
        if (
          Array.from(channelInfoDto.matcher.values()).filter(
            (isReady) => isReady == false,
          ).length
        ) {
          client.in(channelName).emit('readyGame', client.userID);
        }
        client.in(channelName).emit('startGame');
      },
    );
  }
}
