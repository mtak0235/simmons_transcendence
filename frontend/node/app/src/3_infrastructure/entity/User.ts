import SocketDto from "SocketDto";

class User {
  me: SocketDto.User;
  users: SocketDto.UserInfo[];

  public setMe(param: SocketDto.User) {
    this.me = param;
  }

  public addUser(param: SocketDto.UserInfo) {
    const existUser = this.users.findIndex((user) => user.userId);
    this.users.push(param);
  }
}

export default User;
