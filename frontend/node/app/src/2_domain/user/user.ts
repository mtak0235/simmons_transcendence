import Blocks from "../block/block";
import Follows from "../follow/follow";
import GameLogs from "../game/gameLog";
import UserAchievements from "./userAchievement";

type UserConstructorParam = {
  id: number;
  username: string;
  displayName: string;
  email: string;
  imagePath: string;
  twoFactor: boolean;
  createdAt: Date;
  updatedAt: Date;
  follows: Follows[];
  blocks: Blocks[];
  gameLogPlayerA: GameLogs[];
  gameLogPlayerB: GameLogs[];
  userAchievements: UserAchievements[];
};

class User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  imagePath: string;
  twoFactor: boolean;
  createdAt: Date;
  updatedAt: Date;
  follows: Follows[];
  blocks: Blocks[];
  gameLogPlayerA: GameLogs[];
  gameLogPlayerB: GameLogs[];
  userAchievements: UserAchievements[];

  private constructor(param: UserConstructorParam) {
    this.id = param.id;
    this.username = param.username;
    this.displayName = param.displayName;
    this.email = param.email;
    this.imagePath = param.imagePath;
    this.twoFactor = param.twoFactor;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
    this.follows = param.follows;
    this.blocks = param.blocks;
    this.gameLogPlayerA = param.gameLogPlayerA;
    this.gameLogPlayerB = param.gameLogPlayerB;
    this.userAchievements = param.userAchievements;
  }

  static initial = (): User => {
    return new User({
      id: 0,
      username: "taesonkim",
      displayName: "taeskim",
      email: "sr9872@naver.com",
      imagePath: "https://picsum.photos/id/237/200/300",
      twoFactor: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      follows: [],
      blocks: [],
      gameLogPlayerA: [],
      gameLogPlayerB: [],
      userAchievements: [],
    });
  };

  static fromJson = (json: any): User => {
    return new User({
      id: json["id"],
      username: json["username"],
      displayName: json["displayName"],
      email: json["email"],
      imagePath: json["imagePath"],
      twoFactor: json["twoFactor"],
      createdAt: json["createdAt"],
      updatedAt: json["updatedAt"],
      follows: json["follows"],
      blocks: json["blocks"],
      gameLogPlayerA: json["gameLogPlayerA"],
      gameLogPlayerB: json["gameLogPlayerB"],
      userAchievements: json["userAchievements"],
    });
  };
}

export default User;
