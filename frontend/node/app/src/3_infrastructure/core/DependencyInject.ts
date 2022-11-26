import Get from "../../lib/di/get";
import GameLogRepository from "../game/GameLogRepository";
import PageRepository from "../page/PageRepository";
import UserRepository from "@infrastructure/user/UserRepository";
import Http from "@infrastructure/http/Http";
import Socket from "@infrastructure/socket/Socket";
import SocketEmit from "@infrastructure/socket/SocketEmit";
import ISocket from "@domain/socket/ISocket";

const dependencyInject = () => {
  const socket = new Socket();
  Get.put("IHttp", new Http());
  Get.put("ISocket", socket);
  Get.put("ISocketEmit", new SocketEmit(socket));

  Get.put("IPageRepository", new PageRepository());
  Get.put("IGameLogRepository", new GameLogRepository());
  Get.put("IUserRepository", new UserRepository());
};

export default dependencyInject;
