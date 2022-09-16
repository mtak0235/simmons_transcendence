import React, { useEffect } from "react";
import Get from "@root/lib/di/get";
import ISocket from "@domain/socket/ISocket";
import { MainPageDto } from "@presentation/components/SocketDto";
import { useRecoilValue } from "recoil";
import { getLoginState } from "@presentation/components/LoginHandler";

interface SocketHandlerProps {
  children: React.ReactNode;
}

const SocketHandler = ({ children }: SocketHandlerProps) => {
  const socket: ISocket<any, any> = Get.get("ISocket");
  const loggedIn = useRecoilValue(getLoginState);

  // todo: update: socket response data type to Dto
  useEffect(() => {
    // connection
    if (loggedIn === 1) {
      socket.connect().then(() => {
        console.log(loggedIn);
        console.log(socket.socket);

        // todo: Main Page
        socket.on("single:user:connected", (data: MainPageDto) => {
          console.log(data);
        });
        // todo: Main Page
        socket.on("broad:user:connected", (data: any) => {
          console.log(data);
        });

        // disconnection
        // todo: Main Page
        socket.on("broad:user:disconnected", (data: any) => {});

        // createChannel
        // todo: update: 백엔드 채널 이름 수정 create -> created
        socket.on("single:channel:createdChannel", (data: any) => {});
        // todo: Main Page
        socket.on("broad:channel:createdChannel", (data: any) => {});

        // updateChannel
        // todo: update: 백엔드 채널 이름 수정 update -> updated
        // todo: add: 백엔드에도 single 응답을 내려줘야 할까?
        // todo: Main Page
        socket.on("broad:channel:updatedChannel", (data: any) => {});

        // inChannel
        socket.on("single:channel:inChannel", (data: any) => {});
        socket.on("group:channel:inChannel", (data: any) => {});

        // outChannel
        socket.on("single:channel:outChannel", (data: any) => {});
        // todo: Main Page
        socket.on("broad:channel:setAdmin", (data: any) => {}); // todo: duplicate: line to 46: setAdmin
        // todo: Main Page
        socket.on("broad:channel:deleteChannel", (data: any) => {});

        // inviteUser
        socket.on("single:channel:inviteUser", (data: any) => {});

        // setAdmin
        // todo: Main Page
        socket.on("broad:channel:setAdmin", (data: any) => {});

        // kickOutUser
        socket.on("single:channel:kickOut", (data: any) => {});
        socket.on("group:channel:kickOut", (data: any) => {});

        // muteUser
        socket.on("group:channel:muteUser", (data: any) => {});

        // waitingGame
        socket.on("group:channel:getGameParticipants", (data: any) => {});

        // readyGame
        socket.on("group:channel:readyGame", (data: any) => {});
        socket.on("group:channel:startGame", (data: any) => {});

        // sendMSG
        // todo: update: sendMsg -> sendMessage 약어 수정
        socket.on("group:channel:sendMessage", (data: any) => {});

        // sendDM
        socket.on("single:channel:sendDirectMessage", (data: any) => {});

        // blockUser
        socket.on("single:user:blockUser", (data: any) => {});

        // followUser
        socket.on("single:user:followUser", (data: any) => {});
        socket.on("single:user:followedUser", (data: any) => {});

        // unfollowUser
        socket.on("single:user:unFollowUser", (data: any) => {});
      });
    }

    return () => {
      socket.reRender();
    };
  }, []);

  return <>{children}</>;
};

export default SocketHandler;
