import { createContext } from "react";
import socketIo from "socket.io-client";

export const socket = socketIo(String(process.env.REACT_APP_BACK_URL), {
  withCredentials: true,
});
export const SocketContext = createContext(socket);

export const SOCKET_EVENT = {
  JOIN_ROOM: "JOIN_ROOM",
  UPDATE_NICKNAME: "UPDATE_NICKNAME",
  SEND_MESSAGE: "SEND_MESSAGE",
  RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
};

socket.on("connect", () => {
  console.log("socket server connected.");
});

socket.on("disconnect", () => {
  console.log("socket server disconnected.");
});
