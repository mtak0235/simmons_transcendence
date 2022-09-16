import IUserRepository from "@domain/user/IUserRepository";
import User from "@domain/user/user";
import Get from "@root/lib/di/get";
import { IHttp } from "@domain/http/IHttp";
import {
  atom,
  RecoilState,
  RecoilValueReadOnly,
  selector,
  useRecoilValue,
} from "recoil";
import { Cookies } from "react-cookie";
import { HttpRequest } from "@domain/http/HttpRequest";

// export const textState1: RecoilState<number> = atom({
//   key: "textState111",
//   default: 0,
// });
class UserRepository implements IUserRepository {
  private readonly connection = Get.get<IHttp>("IHttp");
  private cookie = new Cookies();

  async getUserProfile(userId: number): Promise<User> {
    return User.fromJson(await this.connection.getUserProfile(85274));
  }

  textState(): RecoilState<number> {
    return atom({
      key: "textState111",
      default: 0,
    });
  }

  charCountState(): RecoilValueReadOnly<number> {
    return selector({
      key: "textState111",
      get: ({ get }) => {
        return get(this.textState());

        // return text;
      },
    });
  }

  test() {
    console.log(localStorage.getItem("accessToken"));
    console.log(this.cookie.get("access_token"));
  }
}

export default UserRepository;
