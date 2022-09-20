import Get from "../../lib/di/get";
import GameLogRepository from "../game/GameLogRepository";
import PageRepository from "../page/PageRepository";
import UserRepository from "@infrastructure/user/UserRepository";
import Http from "@infrastructure/http/Http";
import Socket from "@infrastructure/socket/Socket";
import SocketEmit from "@infrastructure/socket/SocketEmit";

const dependencyInject = () => {
  Get.put("IHttp", new Http());
  Get.put("ISocket", new Socket());
  Get.put("ISocketEmit", new SocketEmit());

  Get.put("IPageRepository", new PageRepository());
  Get.put("IGameLogRepository", new GameLogRepository());
  Get.put("IUserRepository", new UserRepository());
};

export default dependencyInject;
