import { selectorFamily, useRecoilValue } from "recoil";
import IGameLogRepository from "../../2_domain/game/IGameLogRepository";
import Get from "../../lib/di/get";
import Channel from "../../2_domain/game/channel";
import { useEffect } from "react";

interface ChannelSelectorParamInterface {
  repo: IGameLogRepository;
}

interface ChannelSelectorParams extends ChannelSelectorParamInterface {
  [key: string]: any;
}

export const channelLogsSelector = selectorFamily<
  Channel[],
  ChannelSelectorParams
>({
  key: "channelSelectorKey",
  get: (param) => async () => {
    const channels = await param.repo.getChannels();
    return channels;
  },
});

// const useChannelInfo = () =>{
//   repo = Get.get<
// }
const useChannel = () => {
  const repo = Get.get<IGameLogRepository>("IGameLogRepository");
  const channels = useRecoilValue(channelLogsSelector({ repo: repo }));
  return channels;
};

export default useChannel;
