import Achievement from "./achievement";

interface IAchievementRepository {
  getAchievement(role: string): Promise<Achievement[]>;
}

export default IAchievementRepository;
