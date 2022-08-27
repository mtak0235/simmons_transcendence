import { selectorFamily, useRecoilValue } from "recoil";
import IGameLogRepository from "../../2_domain/game/IGameLogRepository";
import Get from "../../lib/di/get";
import GameLogs from "../../2_domain/game/gameLog";

interface GameLogsSelectorParamInterface {
  repo: IGameLogRepository;
}

interface GameLogsSelectorParams extends GameLogsSelectorParamInterface {
  [key: string]: any;
}

export const gameLogsSelector = selectorFamily<
  GameLogs,
  GameLogsSelectorParams
>({
  key: "gameLogsSelectorKey",
  get: (param) => async () => {
    const gameLogs = await param.repo.getGameLog();
    return gameLogs;
  },
});

const useGameLogs = () => {
  const repo = Get.get<IGameLogRepository>("IGameLogRepository");
  const gameLogs = useRecoilValue(gameLogsSelector({ repo: repo }));
  return gameLogs;
};

export default useGameLogs;
