import { useEffect } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";

import SocketDto from "SocketDto";
import ISocket from "@domain/socket/ISocket";
import Get from "@root/lib/di/get";
import RecoilAtom from "@infrastructure/recoil/RecoilAtom";
import { getRecoil } from "recoil-nexus";

export const getTime = () => {
  const date = new Date();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `[${minute < 10 ? "0" + minute : minute}:${
    second < 10 ? "0" + second : second
  }]`;
};

const useChannelEvent = () => {
  const socket: ISocket<any, any> = Get.get("ISocket");
  const [users, setUsers] = useRecoilState(RecoilAtom.user.users);
  const [channelPublic, setChannelPublic] = useRecoilState(
    RecoilAtom.channel.channelPublic
  );
  const [, setChannelPrivate] = useRecoilState(
    RecoilAtom.channel.channelPrivate
  );
  const [, setAlarm] = useRecoilState(RecoilAtom.alarm);
  const [, setMessage] = useRecoilState(RecoilAtom.channel.message);
  const [, setChannels] = useRecoilState(RecoilAtom.channel.channels);
  const resetPublic = useResetRecoilState(RecoilAtom.channel.channelPublic);
  const resetPrivate = useResetRecoilState(RecoilAtom.channel.channelPrivate);
  const resetMessage = useResetRecoilState(RecoilAtom.channel.message);
  const navigate = useNavigate();

  const handleSingleCreateChannel = (data: SocketDto.ChannelSingle) => {
    setChannelPublic(data.channelPublic);
    setChannelPrivate(data.channelPrivate);
    navigate(`/game/${data.channelPublic.channelId}`); // todo: 맞는 게임 페이지로 이동
  };

  const handleSingleInChannel = (data: SocketDto.ChannelSingle) => {
    setChannelPublic(data.channelPublic);
    setChannelPrivate(data.channelPrivate);
    navigate(`/game/${data.channelPublic.channelId}`); // todo: 맞는 게임 페이지로 이동
  };

  const handleSingleOutChannel = () => {
    resetPublic();
    resetPrivate();
    resetMessage();
    navigate("/");
  };

  const handleSingleInviteUser = (data: SocketDto.InviteUser) => {
    setAlarm((curr) => [...curr, data]);
  };

  const handleSingleKickOut = () => {
    // todo: Alarm db 만들어야함!!
  };

  const handleSingleSendDirectMessage = (data: SocketDto.DirectMessage) => {
    const sourceUser = getRecoil(RecoilAtom.user.users).find(
      (user) => user.userId === data.sourceId
    );

    setMessage({
      sourceId: sourceUser.userId,
      targetId: data.targetId,
      username: sourceUser.username,
      message: data.message,
      time: getTime(),
    });
  };

  const handleGroupInChannel = (data: number) => {
    setChannelPrivate((curr) => {
      const channel = { ...curr };
      channel.users.push(data);
      // curr.users.push(data);
      return { ...channel };
    });
  };

  const handleGroupOutChannel = (data: number) => {
    setChannelPrivate((curr) => {
      curr.users = curr.users.filter((id) => id !== data);
      return { ...curr };
    });
  };

  const handleGroupKickOut = (data: number) => {
    const sourceUser = users.find((user) => user.userId === data);

    setMessage({
      sourceId: data,
      targetId: undefined,
      username: "System",
      message: `${sourceUser.username}님이 강제퇴장 되었습니다.`,
      time: getTime(),
    });
  };

  const handleGroupMuteUser = (data: SocketDto.MuteUser) => {
    const sourceUser = users.find((user) => user.userId === data.userId);

    setMessage({
      sourceId: data.userId,
      username: "System",
      message: `${sourceUser.username}님이 5분간 채팅금지 되었습니다.`,
      time: getTime(),
    });
  };

  const handleGroupWaitingGame = (data: SocketDto.GameQueue) => {
    setChannelPrivate((curr) => {
      curr.matcher = [...data.matcher];
      curr.waiter = [...data.waiter];
      return { ...curr };
    });
  };

  const handleGroupLeaveGame = (data: SocketDto.GameQueue) => {
    setChannelPrivate((curr) => {
      curr.matcher = [...data.matcher];
      curr.waiter = [...data.waiter];
      return { ...curr };
    });
  };

  const handleGroupReadyGame = (data: SocketDto.Matcher[]) => {
    setChannelPrivate((curr) => {
      curr.matcher = [...data];
      return { ...curr };
    });
  };

  // todo: startGame, endGame, ...Game events
  const handleGroupSendMessage = (data: SocketDto.Message) => {
    const sourceUser = users.find((user) => user.userId === data.userId);

    setMessage({
      sourceId: sourceUser.userId,
      targetId: undefined,
      username: sourceUser.username,
      message: data.message,
      time: getTime(),
    });
  };

  const handleBroadCreateChannel = (data: SocketDto.ChannelPublic) => {
    setChannels((curr) => [...curr, data]);
  };

  const handleBroadUpdateChannel = (data: SocketDto.ChannelPublic) => {
    if (channelPublic.channelId === data.channelId) setChannelPublic(data);

    setChannels((curr) => {
      return [
        ...curr.map((channel) => {
          if (channel.channelId === data.channelId) channel = data;
          return channel;
        }),
      ];
    });
  };

  const handleBroadDeleteChannel = (data: number) => {
    setChannels((curr) => [
      ...curr.filter((channel) => channel.channelId !== data),
    ]);
  };

  const handleBroadSetAdmin = (data: SocketDto.ChannelAdmin) => {
    if (channelPublic.channelId === data.channelId) {
      setChannelPublic((curr) => {
        curr.adminId = data.adminId;
        curr.ownerId = data.ownerId;
        return curr;
      });
    }

    setChannels((curr) => {
      return curr.map((channel) => {
        if (channel.channelId === data.channelId) {
          channel.adminId = data.adminId;
          channel.ownerId = data.ownerId;
        }
        return channel;
      });
    });
  };

  useEffect(() => {
    // todo: update: 백엔드 채널 이름 수정 create -> created
    socket.on("single:channel:createChannel", handleSingleCreateChannel);
    socket.on("broad:channel:createChannel", handleBroadCreateChannel);

    // updateChannel
    socket.on("broad:channel:updateChannel", handleBroadUpdateChannel);

    // inChannel
    socket.on("single:channel:inChannel", handleSingleInChannel);
    socket.on("group:channel:inChannel", handleGroupInChannel);

    // outChannel
    socket.on("single:channel:outChannel", handleSingleOutChannel);
    socket.on("group:channel:outChannel", handleGroupOutChannel);
    socket.on("broad:channel:setAdmin", handleBroadSetAdmin);
    socket.on("broad:channel:deleteChannel", handleBroadDeleteChannel);

    // inviteUser
    socket.on("single:channel:inviteUser", handleSingleInviteUser);

    // kickOutUser
    socket.on("single:channel:kickOut", handleSingleKickOut);
    socket.on("group:channel:kickOut", handleGroupKickOut);

    // muteUser
    socket.on("group:channel:muteUser", handleGroupMuteUser);

    // waitingGame
    socket.on("group:channel:waitingGame", handleGroupWaitingGame);

    // leaveGame
    socket.on("group:channel:leaveGame", handleGroupLeaveGame);

    // readyGame
    socket.on("group:channel:readyGame", handleGroupReadyGame);

    // todo: 백엔드 개발에 따라 작성
    // socket.on("group:channel:startGame", handleGroup.);

    // sendMSG
    socket.on("group:channel:sendMessage", handleGroupSendMessage);

    // sendDM
    socket.on(
      "single:channel:sendDirectMessage",
      handleSingleSendDirectMessage
    );
  }, []);

  return;
};

export default useChannelEvent;
