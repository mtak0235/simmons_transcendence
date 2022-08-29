import GameLogs from "../../2_domain/game/gameLog";
import IGameLogRepository from "../../2_domain/game/IGameLogRepository";
class GameLogRepository implements IGameLogRepository {
  async getGameLog(): Promise<GameLogs> {
    return GameLogs.fromJson({
      id: "1234",
      playerAId: "playerAId",
      playerBId: "playerBId",
      result: "result",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      playerA: "seonkim",
      playerB: "mtak",
    });
  }
}

export default GameLogRepository;
