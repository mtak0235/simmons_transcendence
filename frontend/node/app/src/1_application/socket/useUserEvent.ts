import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";

import SocketDto from "SocketDto";
import Get from "@root/lib/di/get";
import ISocket from "@domain/socket/ISocket";
import RecoilAtom from "@infrastructure/recoil/RecoilAtom";
import RecoilSelector from "@infrastructure/recoil/RecoilSelector";
import { getRecoil, setRecoil } from "recoil-nexus";

const useUserEvent = () => {
  const socket: ISocket<any, any> = Get.get("ISocket");
  const [me2, setMe2] = useState(undefined);
  const [me, setMe] = useRecoilState(RecoilAtom.user.me);
  const [users, setUsers] = useRecoilState(RecoilAtom.user.users);
  const [, setChannels] = useRecoilState(RecoilAtom.channel.channels);
  const [, setError] = useRecoilState(RecoilAtom.error);
  // const users1 = useRecoilValue(selectorUsers);

  const handleConnected = (data: SocketDto.Connection) => {
    setMe(data.me);
    // setRecoil(recoilUsers, data.users);
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
    // setError(data);
  };

  const handleBlockUser = (data: SocketDto.User) => {
    setMe(data);
  };

  const handleFollowUser = (data: SocketDto.User) => {
    setMe(data);
  };

  const handleUnfollowUser = (data: SocketDto.User) => {
    setMe(data);
  };

  const handleChangeStatus = (data: SocketDto.UserInfo) => {
    console.log(data);
    setRecoil(RecoilAtom.user.users, (currVal) => {
      const userIdx = currVal.findIndex((user) => user.userId === data.userId);

      if (userIdx === -1) {
        return [...currVal, data];
      } else {
        if (data.status === "offline") {
          return [...currVal.filter((user, idx) => idx !== userIdx)];
        } else {
          return [
            ...currVal.map((user, idx) => {
              if (idx === userIdx) user.status = data.status;
              return user;
            }),
          ];
        }
      }

      // return [...users];
    });
  };

  useEffect(() => {
    // socket.on("broad:user:changeStatus", handleChangeStatus);
    socket.on("single:user:connected", handleConnected);
    socket.on("single:user:disconnected", handleDisconnect);
    socket.on("single:user:error", handleError);
    socket.on("single:user:blockUser", handleBlockUser);
    socket.on("single:user:followUser", handleFollowUser);
    socket.on("single:user:unFollowUser", handleUnfollowUser);
    socket.on("broad:user:changeStatus", handleChangeStatus);
  }, []);

  return;
};

export default useUserEvent;
