import Achievements from "../achievement/achievement";
import User from "./user";

type UserAchievementsParam = {
  id: number;
  userId: number;
  achievementId: number;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  achievements: Achievements;
}

class UserAchievements {
  id: number;
  userId: number;
  achievementId: number;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  achievements: Achievements;

  private constructor(param: UserAchievementsParam) {
    this.id = param.id;
    this.userId = param.userId;
    this.achievementId = param.achievementId;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
    this.user = param.user;
    this.achievements = param.achievements;
  }

  static fromJson = (json: any): UserAchievements => {
    return new UserAchievements({
      id : json["id"],
      userId : json["userId"],
      achievementId : json["achievementId"],
      createdAt : json["createdAt"],
      updatedAt : json["updatedAt"],
      user : json["user"],
      achievements : json["achievements"],
    })
  }
}
export default UserAchievements;