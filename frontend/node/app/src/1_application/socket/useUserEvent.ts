import { useEffect } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";

import SocketDto from "SocketDto";
import Get from "@root/lib/di/get";
import ISocket from "@domain/socket/ISocket";
import RecoilAtom from "@infrastructure/recoil/RecoilAtom";

const useUserEvent = () => {
  const socket: ISocket<any, any> = Get.get("ISocket");
  const [me, setMe] = useRecoilState(RecoilAtom.user.me);
  const [, setUsers] = useRecoilState(RecoilAtom.user.users);
  const [, setChannels] = useRecoilState(RecoilAtom.channel.channels);
  const [, setError] = useRecoilState(RecoilAtom.error);

  const handleConnected = (data: SocketDto.Connection) => {
    setMe(data.me);
    setUsers(data.users);
    setChannels(data.channels);
  };

  const handleDisconnect = () => {
    useResetRecoilState(RecoilAtom.user.me);
    useResetRecoilState(RecoilAtom.user.users);
    useResetRecoilState(RecoilAtom.channel.channelPublic);
    useResetRecoilState(RecoilAtom.channel.channelPrivate);
    useResetRecoilState(RecoilAtom.channel.message);
    useResetRecoilState(RecoilAtom.channel.channels);
    useResetRecoilState(RecoilAtom.error);
    useResetRecoilState(RecoilAtom.alarm);
  };

  const handleError = (data: SocketDto.Error) => {
    console.log(data);
    setError(data);
  };

  const handleBlockUser = (data: number) => {
    setMe((curr) => {
      curr.blocks.push(data);
      return curr;
    });
  };

  const handleFollowUser = (data: number) => {
    setMe((curr) => {
      curr.follows.push(data);
      return curr;
    });
  };

  const handleUnfollowUser = (data: number) => {
    setMe((curr) => {
      curr.follows = curr.follows.filter((id) => id !== data);
      return curr;
    });
  };

  const handleChangeStatus = (data: SocketDto.UserInfo) => {
    if (me.userId === data.userId) {
      setMe((curr) => {
        curr.status = data.status;
        return curr;
      });
    } else {
      setUsers((curr) => {
        if (curr.findIndex((user) => user.userId === data.userId) === -1) {
          curr.push(data);
        } else {
          curr.map((user, idx) => {
            if (user.userId === data.userId) {
              if (data.status === "offline") curr.splice(idx, 1);
              else user.status = data.status;
            }
          });
        }
        return curr;
      });
    }
  };

  useEffect(() => {
    socket.on("broad:user:changeStatus", handleChangeStatus);
    socket.on("single:user:connected", handleConnected);
    socket.on("single:user:disconnected", handleDisconnect);
    socket.on("single:user:error", handleError);
    socket.on("single:user:blockUser", handleBlockUser);
    socket.on("single:user:followUser", handleFollowUser);
    socket.on("single:user:unFollowUser", handleUnfollowUser);
  }, []);

  return;
};

export default useUserEvent;
