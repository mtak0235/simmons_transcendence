import { createContext } from "react";
import socketIo from "socket.io-client";
import dayjs from "dayjs";

export const socket = socketIo(String(process.env.REACT_APP_BACK_URL), {
  withCredentials: true,
});

export const SocketContext = createContext(socket);
export const UserContext = createContext({});

export const SOCKET_EVENT = {
  SINGLE_USER_CONNECTED: "single:user:connected",
  BROAD_USER_CONNECTED: "broad:user:connected",
  SINGLE_USER_ERROR: "single:user:error",
  BROAD_USER_DISCONNECTED: "broad:user:disconnected",
  SINGLE_CHANNEL_CREATECHANNEL: "single:channel:createChannel",
  BROAD_CHANNEL_CREATEDCHANNEL: "broad:channel:createdChannel",
  BROAD_CHANNEL_UPDATECHANNEL: "broad:channel:updateChannel",
  SINGLE_CHANNEL_INCHANNEL: "single:channel:inChannel",
  GROUP_CHANNEL_INCHANNEL: "group:channel:inChannel",
  SINGLE_CHANNEL_OUTCHANNEL: "single:channel:outChannel",
  BROAD_CHANNEL_SETADMIN: "broad:channel:setAdmin",
  BROAD_CHANNEL_DELETECHANNEL: "broad:channel:deleteChannel",
  SINGLE_CHANNEL_INVITEUSER: "single:channel:inviteUser",
  SINGLE_CHANNEL_KICKOUT: "single:channel:kickOut",
  GROUP_CHANNEL_KICKOUT: "group:channel:kickOut",
  GROUP_CHANNEL_MUTEUSER: "group:channel:muteUser",
  GROUP_CHANNEL_GETGAMEPARTICIPANTS: "group:channel:getGameParticipants",
  GROUP_CHANNEL_READYGAME: "group:channel:readyGame",
  GROUP_CHANNEL_STARTGAME: "group:channel:startGame",
  GROUP_CHANNEL_SENDMSG: "group:channel:sendMsg",
  SINGLE_CHANNEL_SENDDM: "single:channel:sendDm",
  SINGLE_USER_BLOCKUSER: "single:user:blockUser",
  SINGLE_USER_FOLLOWUSER: "single:user:followUser",
  FOLLOWEDUSER: "followedUser",

  //todo: remove
  JOIN_ROOM: "JOIN_ROOM",
  UPDATE_NICKNAME: "UPDATE_NICKNAME",
  SEND_MESSAGE: "SEND_MESSAGE",
  RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
};

socket.on("connect", () => {
  console.log("<<socket server connected.>>");
});

socket.on("disconnect", () => {
  console.log("<<socket server disconnected.>>");
});

export const makeMessage = (pongData) => {
  const { prevNickname, nickname, content, type, time } = pongData;

  let nicknameLabel;
  let contentLabel = "";

  switch (type) {
    case SOCKET_EVENT.JOIN_ROOM: {
      contentLabel = `${nickname} has joined the room.`;
      break;
    }
    case SOCKET_EVENT.UPDATE_NICKNAME: {
      contentLabel = `User's name has been changed.\n ${prevNickname} => ${nickname}.`;
      break;
    }
    case SOCKET_EVENT.SEND_MESSAGE: {
      contentLabel = String(content);
      nicknameLabel = nickname;
      break;
    }
    default:
  }

  return {
    nickname: nicknameLabel,
    content: contentLabel,
    time: dayjs(time).format("HH:mm"),
  };
};
