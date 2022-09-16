type AchievementParam = {
  id: number;
  title: string;
  content: string;
};

class Achievements {
  id: number;
  title: string;
  content: string;

  private constructor(param: AchievementParam) {
    this.id = param.id;
    this.title = param.title;
    this.content = param.content;
  }

  static fromJson = (json: any): Achievements => {
    return new Achievements({
      id: json["id"],
      title: json["title"],
      content: json["content"],
    });
  };
}

export default Achievements;
