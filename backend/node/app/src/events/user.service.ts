import { Injectable } from '@nestjs/common';
import { ChannelDto, RoomDto } from './room-dto';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  private channelList: Record<string, ChannelInfoDto>;

  constructor() {
    this.channelList = {
    };
  }

  createChatRoom(client: Socket, roomName: string): void {
    const roomId = `room:${uuidv4()}`;
    const nickname: string = client.data.nickname;
    this.channelList[roomId] = {
      roomId,
      cheifId: client.id,
      roomName,
    };
    client.data.roomId = roomId;
    client.rooms.clear();
    client.join(roomId);
    client.emit('getMessage', {
      id: null,
      nickname: '안내',
      message: '"' + nickname + '"님이 "' + roomName + '"방을 생성하였습니다.',
    });
  }

  enterChatRoom(client: Socket, roomId: string) {
    client.data.roomId = roomId;
    client.rooms.clear();
    client.join(roomId);
    const { nickname } = client.data;
    const { roomName } = this.getChatRoom(roomId);
    client.to(roomId).emit('getMessage', {
      id: null,
      nickname: '안내',
      message: `"${nickname}"님이 "${roomName}"방에 접속하셨습니다.`,
    });
  }

  exitChatRoom(client: Socket, roomId: string) {
    client.data.roomId = `room:lobby`;
    client.rooms.clear();
    client.join(`room:lobby`);
    const { nickname } = client.data;
    client.to(roomId).emit('getMessage', {
      id: null,
      nickname: '안내',
      message: '"' + nickname + '"님이 방에서 나갔습니다.',
    });
  }

  getChatRoom(roomId: string): RoomDto {
    return this.channelList[roomId];
  }

  getchannelList(): Record<string, RoomDto> {
    return this.channelList;
  }

  deleteChatRoom(roomId: string) {
    delete this.channelList[roomId];
  }
}
