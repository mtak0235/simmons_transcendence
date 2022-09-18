import React, { useEffect } from "react";
import Get from "@root/lib/di/get";
import ISocket from "@domain/socket/ISocket";
import SocketDto from "SocketDto";
import { useRecoilValue } from "recoil";
import { getLoginState } from "@presentation/components/LoginHandler";
import { UserEvent } from "@application/socket/handleSocketEvent";

interface SocketHandlerProps {
  children: React.ReactNode;
}

const SocketHandler = ({ children }: SocketHandlerProps) => {
  const socket: ISocket<any, any> = Get.get("ISocket");
  const loggedIn = useRecoilValue(getLoginState);

  // todo: 내일 할 거: 백엔드 응답값 통일 (ex. 사용자 상태 변경), 명세 수정 해야함 (정확히... 제발)

  // todo: update: socket response data type to Dto
  useEffect(() => {
    // connection
    if (loggedIn === 1) {
      socket.connect().then(() => {
        console.log(loggedIn);
        console.log(socket.socket);
        socket.on("broad.user:changeStatus", UserEvent.single.connected);
        // todo: Main Page
        socket.on("single:user:connected", (data: any) => {
          console.log(data);
        });
        socket.on("single:user:error", (data: SocketDto.Error) => {
          console.log(data);
        });

        // blockUser
        socket.on("single:user:blockUser", (data: { userId: number }) => {});

        // followUser
        socket.on("single:user:followUser", (data: { userId: number }) => {});

        socket.on("single:user:followedUser", (data: { userId: number }) => {});

        // unfollowUser
        socket.on("single:user:unFollowUser", (data: { userId: number }) => {});

        // createChannel
        // todo: update: 백엔드 채널 이름 수정 create -> created
        socket.on(
          "single:channel:createdChannel",
          (data: {
            channelPublic: SocketDto.ChannelPublic;
            channelPrivate: SocketDto.ChannelPrivate;
          }) => {}
        );

        // todo: Main Page
        socket.on(
          "broad:channel:createdChannel",
          (data: { channelPublic: SocketDto.ChannelPublic }) => {}
        );

        // updateChannel
        // todo: update: 백엔드 채널 이름 수정 update -> updated
        // todo: add: 백엔드에도 single 응답을 내려줘야 할까?
        // todo: Main Page
        socket.on(
          "broad:channel:updatedChannel",
          (data: { channelPublic: SocketDto.ChannelPublic }) => {}
        );

        // inChannel
        socket.on(
          "single:channel:inChannel",
          (data: {
            channelPublic: SocketDto.ChannelPublic;
            channelPrivate: SocketDto.ChannelPrivate;
          }) => {}
        );
        socket.on("group:channel:inChannel", (data: { userId: number }) => {});

        // outChannel
        socket.on(
          "single:channel:outChannel",
          (data: { channelId: number }) => {}
        );

        socket.on("group:channel:outChannel", (data: { userId: number }) => {});

        // todo: Main Page
        socket.on(
          "broad:channel:setAdmin",
          (data: { channelId: number; ownerId: number; adminId: number }) => {}
        );

        // todo: Main Page
        socket.on(
          "broad:channel:deleteChannel",
          (data: { channelId: number }) => {}
        );

        // inviteUser
        socket.on(
          "single:channel:inviteUser",
          (data: {
            userId: number;
            channelId: number;
            channelName: string;
          }) => {}
        );

        // kickOutUser
        socket.on("single:channel:kickOut", () => {});

        socket.on("group:channel:kickOut", (data: { userId: number }) => {});

        // muteUser
        socket.on(
          "group:channel:muteUser",
          (data: { userId: number; expiredAt: number }) => {}
        );

        // waitingGame
        socket.on(
          "group:channel:waitingGame",
          (data: { matcher: SocketDto.Matcher[]; waiter: number[] }) => {}
        );

        // leaveGame
        socket.on(
          "group:channel:leaveGame",
          (data: { matcher: SocketDto.Matcher[]; waiter: number[] }) => {}
        );

        // readyGame
        socket.on(
          "group:channel:readyGame",
          (data: { matcher: SocketDto.Matcher[] }) => {}
        );

        // todo: 백엔드 개발에 따라 작성
        socket.on("group:channel:startGame", (data: any) => {});

        // sendMSG
        socket.on(
          "group:channel:sendMessage",
          (data: { userId: number; message: string }) => {}
        );

        // sendDM
        socket.on(
          "single:channel:sendDirectMessage",
          (data: { userId: number; message: string }) => {}
        );
      });
    }

    return () => {
      socket.reRender();
    };
  }, []);

  return <>{children}</>;
};

export default SocketHandler;
