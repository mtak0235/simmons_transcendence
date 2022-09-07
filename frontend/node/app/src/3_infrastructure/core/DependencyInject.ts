import Get from "../../lib/di/get";
import GameLogRepository from "../game/GameLogRepository";
import PageRepository from "../page/PageRepository";
import UserRepository from "@infrastructure/user/UserRepository";
import Connection from "@infrastructure/connection/Connection";

const dependencyInject = () => {
  Get.put("IConnection", new Connection());
  Get.put("IPageRepository", new PageRepository());
  Get.put("IGameLogRepository", new GameLogRepository());
  Get.put("IUserRepository", new UserRepository());
};

export default dependencyInject;
