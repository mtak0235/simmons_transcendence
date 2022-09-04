import User from "../user/user";

type BlocksParam = {
  sourceId: number;
  targetId: number;
  createdAt: Date;
  updatedAt: Date;
  users: User[];
};
export default class Blocks {
  sourceId: number;
  targetId: number;
  createdAt: Date;
  updatedAt: Date;
  users: User[];

  private constructor(param: BlocksParam) {
    this.sourceId = param.sourceId;
    this.targetId = param.targetId;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
    this.users = param.users;
  }

  static fromJson = (json: any): Blocks => {
    return new Blocks({
      sourceId: json["sourceId"],
      targetId: json["targetId"],
      createdAt: json["createdAt"],
      updatedAt: json["updatedAt"],
      users: json["users"],
    });
  };
}
