import Get from "../../lib/di/get";
import GameLogRepository from "../game/GameLogRepository";
import PageRepository from "../page/PageRepository";
import UserRepository from "@infrastructure/user/UserRepository";
import Http from "@infrastructure/http/Http";
import { atom, RecoilState, useRecoilState } from "recoil";
import Socket from "@infrastructure/socket/Socket";

// const classState = (): RecoilState<UserRepository> => {
//   return atom({
//     key: "classState",
//     default: new UserRepository(),
//   });
// };

export class CustomError {
  type: string = "";
  status: number = 0;
}

const dependencyInject = () => {
  Get.put("IHttp", new Http());
  Get.put("IPageRepository", new PageRepository());
  Get.put("IGameLogRepository", new GameLogRepository());
  Get.put("IUserRepository", new UserRepository());
  Get.put("ISocket", new Socket());
  // Get.put("CustomError", new CustomError());
};

export default dependencyInject;
