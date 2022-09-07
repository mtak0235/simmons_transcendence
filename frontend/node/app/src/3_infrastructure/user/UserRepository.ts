import IUserRepository from "@domain/user/IUserRepository";
import User from "@domain/user/user";
import Get from "@root/lib/di/get";
import { IConnection } from "@domain/connection/IConnection";

class UserRepository implements IUserRepository {
  private readonly connection = Get.get<IConnection>("IConnection");

  async getUserProfile(userId: number): Promise<User> {
    return User.fromJson(
      await this.connection.get({
        path: `/users/${userId}/profile`,
        token: "token", // todo: context API get token
        // headers: {},
        // data: {},
      })
    );
  }
}

export default UserRepository;
