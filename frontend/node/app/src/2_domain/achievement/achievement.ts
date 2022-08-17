import UserAchievements from "../user/userAchievement";

type AchievementParam = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userAchievements: UserAchievements[];
}

class Achievements {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userAchievements: UserAchievements[];

  private constructor(param: AchievementParam) {
    this.id = param.id;
    this.title = param.title;
    this.content = param.content;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
    this.userAchievements = param.userAchievements;
  }

  static fromJson = (json: any): Achievements => {
    return new Achievements({
      id: json["id"],
      title: json["title"],
      content: json["content"],
      createdAt: json["createdAt"],
      updatedAt: json["updatedAt"],
      userAchievements: json["userAchievements"],
    })
  }
}

export default Achievements;