import Get from "../../lib/di/get";
import GameLogRepository from "../game/GameLogRepository";
import PageRepository from "../page/PageRepository";

const dependencyInject = () => {
  Get.put("IPageRepository", new PageRepository());
  Get.put("IGameLogRepository", new GameLogRepository());
};

export default dependencyInject;
