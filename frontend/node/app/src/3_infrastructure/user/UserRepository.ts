import IUserRepository from "@domain/user/IUserRepository";
import User from "@domain/user/user";
import Get from "@root/lib/di/get";
import { IConnection } from "@domain/connection/IConnection";
import { atom, RecoilState, RecoilValueReadOnly, selector } from "recoil";

export const textState1: RecoilState<number> = atom({
  key: "textState111",
  default: 0,
});
class UserRepository implements IUserRepository {
  private readonly connection = Get.get<IConnection>("IConnection");

  async getUserProfile(userId: number): Promise<User> {
    return User.fromJson(
      await this.connection.get({
        path: `/users/${userId}/profile`,
        token: "token", // todo: get token to context API
        headers: {},
      })
    );
  }

  textState(): RecoilState<number> {
    return atom({
      key: "textState11",
      default: 0,
    });
  }

  charCountState(): RecoilValueReadOnly<number> {
    return selector({
      key: "textState",
      get: ({ get }) => {
        return get(this.textState());

        // return text;
      },
    });
  }
}

export default UserRepository;
