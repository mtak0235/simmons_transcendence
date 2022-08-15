import {Injectable} from '@nestjs/common';
import {Session, SessionStore} from '@src/event/storage/session-store';
import {MessageStore} from '@src/event/storage/message-store';
import {SocketC} from "@src/event/event.gateway";
import {ChannelListStore} from "@src/event/storage/channel-list-store";

@Injectable()
export class EventService {
    constructor(
        private sessionStore: SessionStore,
        private messageStore: MessageStore,
        private channelListStore: ChannelListStore
    ) {

    }

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
            const {from, to} = message;
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
                connected: session.connected,
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
                .emit('userEnteredServer', {userID: client.userID, channelName});
            client
                .to(channelName)
                .emit('getMessage', `${client.userName}님이 입장하셨습니다.`);
        }
    }

    block(badGuyID: number, userID: number) {
        //reposiory에서 (userID, badGuyID) 저장하기

    }

    friendChanged(param: { isFollowing: boolean; targetID: number; userID: number }) {
        //repository에 { userID:client.userID,targetID, isFollowing: true } 저장하기

    }

    saveMessage(msg: string) {
        this.messageStore.saveMessage(msg);

    }

    kickOut(client: SocketC, badGuyID: string) {
        let channelFullName = this.getChannelFullName(client.rooms, /^room:user:/);
        this.channelListStore.channels
    }
}
