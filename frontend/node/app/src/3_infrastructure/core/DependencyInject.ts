import Get from "../../lib/di/get";
import GameLogRepository from "../game/GameLogRepository";
import PageRepository from "../page/PageRepository";
import UserRepository from "@infrastructure/user/UserRepository";
import Connection from "@infrastructure/connection/Connection";
import { atom, RecoilState, useRecoilState } from "recoil";

const classState = (): RecoilState<UserRepository> => {
  return atom({
    key: "classState",
    default: new UserRepository(),
  });
};

const dependencyInject = () => {
  Get.put("IConnection", new Connection());
  Get.put("IPageRepository", new PageRepository());
  Get.put("IGameLogRepository", new GameLogRepository());
  Get.put("IUserRepository", new UserRepository());
};

export default dependencyInject;
