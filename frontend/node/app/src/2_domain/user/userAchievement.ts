import Achievements from "../achievement/achievement";

type UserAchievementsParam = {
  id: number;
  achievements: Achievements;
};

class UserAchievements {
  id: number;
  achievements: Achievements;

  private constructor(param: UserAchievementsParam) {
    this.id = param.id;
    this.achievements = param.achievements;
  }

  static fromJson = (json: any): UserAchievements => {
    return new UserAchievements({
      id: json["id"],
      achievements: json["achievements"],
    });
  };
}
export default UserAchievements;
