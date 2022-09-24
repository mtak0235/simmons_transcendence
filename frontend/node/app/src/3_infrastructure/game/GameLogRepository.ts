import GameLogs from "../../2_domain/game/gameLog";
import IGameLogRepository from "../../2_domain/game/IGameLogRepository";
import Channel from "../../2_domain/game/channel";
class GameLogRepository implements IGameLogRepository {
  async getGameLog(): Promise<GameLogs> {
    return GameLogs.fromJson({
      id: "1234",
      playerAId: "playerAId",
      playerBId: "playerBId",
      result: "result",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      playerA: "mtak",
      playerB: "seonkim",
    });
  }
  // async getChannels(): Promise<[Channel]> {
  async getChannels() {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        return data;
      });
    return [
      Channel.fromJson({
        adminId: 3,
        channelId: 1,
        accessLayer: "public",
        channelName: "taeskim과 신나는 게임 한판",
        score: 11,
        onGame: true,
      }),
    ];
  }
}

export default GameLogRepository;
