import GameLogs from "./gameLog";

interface IGameLogRepository {
  getGameLog(): Promise<GameLogs>;
}

export default IGameLogRepository;
