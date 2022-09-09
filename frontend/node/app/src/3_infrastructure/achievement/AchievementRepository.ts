import Achievements from "../../2_domain/achievement/achievement";
import IAchievementRepository from "../../2_domain/achievement/IAchievementRepository";

class AchievementRepository implements IAchievementRepository {
  async getAchievement(role: string): Promise<Achievements[]> {
    throw new Error("Method not implemented.");
  }
}

export default AchievementRepository;
