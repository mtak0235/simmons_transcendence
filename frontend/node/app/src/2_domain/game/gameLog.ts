import User from "../user/user";

type GameLogsParam = {
  id: number;
  playerAId: number;
  playerBId: number;
  result: number;
  createdAt: Date;
  updatedAt: Date;
  playerA: User;
  playerB: User;
}

class GameLogs {
  id: number;
  playerAId: number;
  playerBId: number;
  result: number;
  createdAt: Date;
  updatedAt: Date;
  playerA: User;
  playerB: User;

  private constructor(param: GameLogsParam) {
    this.id = param.id; 
    this.playerAId = param.playerAId; 
    this.playerBId = param.playerBId; 
    this.result = param.result; 
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt; 
    this.playerA = param.playerA; 
    this.playerB = param.playerB; 
  }

  static fromJson = (json: any): GameLogs => {
    return new GameLogs({
      id: json["id"],
      playerAId: json["playerAId"],
      playerBId: json["playerBId"],
      result: json["result"],
      createdAt: json["createdAt"],
      updatedAt: json["updatedAt"],
      playerA: json["playerA"],
      playerB: json["playerB"],
    })
  }
}

export default GameLogs