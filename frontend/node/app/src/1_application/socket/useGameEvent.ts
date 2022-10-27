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
    console.log("inputKey1");
    setMatcher((curr) => {
      return [
        ...curr.map((user, idx) => {
          if (idx === data.userIdx) return { ...user, pos: data.pos };
          else return user;
        }),
      ];
    });
    console.log("inputKey2");
  };

  const handleMoveBall = (data: number) => {
    setBall(data);
  };

  const handleStartGame = (data: SocketDto.RoundInitialSetting) => {
    console.log("startGame1");
    setMatcher(data.matcher);
    setBall(data.ball);
    setOnGame(true);
    console.log("startGame2");
  };

  const handleStartRound = (data: SocketDto.RoundInitialSetting) => {
    console.log("startRound1");
    setMatcher(data.matcher);
    setBall(data.ball);
    setOnRound(true);
    setRound(round + 1);
    console.log("startRound2");
  };

  const handleEndGame = (data: SocketDto.GameQueue) => {
    console.log("endGame1");
    setChannelPrivate((curr) => {
      return { ...curr, matcher: [...data.matcher], waiter: [...data.waiter] };
    });
    setOnGame(false);
    setOnRound(false);
    console.log("endGame2");
    setMatcher([]);
    setBall(110);
    setRound(0);
    console.log("endGame3");
  };

  const handleEndRound = (data: SocketDto.GameMatcherInfoDto[]) => {
    console.log("endRound1");
    setMatcher(data);
    setOnRound(false);
    console.log("endRound2");
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
