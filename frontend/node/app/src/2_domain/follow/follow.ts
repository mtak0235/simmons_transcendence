import User from "../user/user";

type FollowsParam = {
  sourceId: number;
  targetId: number;
  createdAt: Date;
  updatedAt: Date;
  users: User[];
}

class Follows {
  sourceId: number;
  targetId: number;
  createdAt: Date;
  updatedAt: Date;
  users: User[];

  private constructor(param: FollowsParam) {
    this.sourceId = param.sourceId;
    this.targetId = param.targetId;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
    this.users = param.users;
  }
  
  static fromJson = (json: any): Follows => {
    return new Follows({
      sourceId: json["sourceId"],
      targetId: json["targetId"],
      createdAt: json["createdAt"],
      updatedAt: json["updatedAt"],
      users: json["users"],
    })
  }
}

export default Follows