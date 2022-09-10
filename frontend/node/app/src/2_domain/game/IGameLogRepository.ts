import GameLogs from "./gameLog";
import Channel from "./channel";

interface IGameLogRepository {
  getGameLog(): Promise<GameLogs>;
  getChannels(): any;
  // getChannels(): Promise<Channel[]>;
}

export default IGameLogRepository;
