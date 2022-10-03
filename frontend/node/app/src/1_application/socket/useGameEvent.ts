import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";

import SocketDto from "SocketDto";
import Get from "@root/lib/di/get";
import ISocket from "@domain/socket/ISocket";
import RecoilAtom from "@infrastructure/recoil/RecoilAtom";
import RecoilSelector from "@infrastructure/recoil/RecoilSelector";
import { getRecoil, setRecoil } from "recoil-nexus";

const useGameEvent = () => {
  const socket: ISocket<any, any> = Get.get("ISocket");
  const [, setChannelPrivate] = useRecoilState(
    RecoilAtom.channel.channelPrivate
  );
  const [round, setRound] = useRecoilState(RecoilAtom.game.round);
  const [, setOnGame] = useRecoilState(RecoilAtom.game.onGame);
  const [, setOnRound] = useRecoilState(RecoilAtom.game.onRound);
  const [, setMatcher] = useRecoilState(RecoilAtom.game.matcher);
  const [, setBall] = useRecoilState(RecoilAtom.game.ball);

  const handleInputKey = (data: SocketDto.ChangeKeyPos) => {
    setMatcher((curr) => {
      return [
        ...curr.map((user, idx) => {
          if (idx === data.userIdx) user.pos = data.pos;
          return user;
        }),
      ];
    });
  };

  const handleMoveBall = (data: number) => {
    setBall(data);
  };

  const handleStartGame = (data: SocketDto.RoundInitialSetting) => {
    setMatcher(data.matcher);
    setBall(data.ball);
    setOnGame(true);
  };

  const handleStartRound = (data: SocketDto.RoundInitialSetting) => {
    setMatcher(data.matcher);
    setBall(data.ball);
    setOnRound(true);
    setRound(round + 1);
  };

  const handleEndGame = (data: SocketDto.GameQueue) => {
    setChannelPrivate((curr) => {
      curr.matcher = data.matcher;
      curr.waiter = data.waiter;
      return { ...curr };
    });
    useResetRecoilState(RecoilAtom.game.matcher);
    useResetRecoilState(RecoilAtom.game.ball);
    useResetRecoilState(RecoilAtom.game.round);
    useResetRecoilState(RecoilAtom.game.onGame);
    useResetRecoilState(RecoilAtom.game.onRound);
  };

  const handleEndRound = (data: SocketDto.GameMatcherInfoDto[]) => {
    setMatcher(data);
    setOnRound(false);
  };

  useEffect(() => {
    socket.on("group:game:inputKey", handleInputKey);
    socket.on("group:game:moveBall", handleMoveBall);
    socket.on("group:game:startGame", handleStartGame);
    socket.on("group:game:startRound", handleStartRound);
    socket.on("group:game:endGame", handleEndGame);
    socket.on("group:game:endRound", handleEndRound);
  }, []);

  return;
};

export default useGameEvent;
