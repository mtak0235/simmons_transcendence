import { RecoilState } from "recoil";
import SocketDto from "SocketDto";

interface IRecoilAtom<T> {
  user: {
    me: RecoilState<SocketDto.User>;
    users: RecoilState<SocketDto.UserInfo[]>;
  };
  channel: {
    channelPublic: RecoilState<SocketDto.ChannelPublic>;
    channelPrivate: RecoilState<SocketDto.ChannelPrivate>;
    message: RecoilState<SocketDto.ChannelMessage>;
    channels: RecoilState<SocketDto.ChannelPublic[]>;
  };
  error: RecoilState<SocketDto.Error>;
  alarm: RecoilState<SocketDto.InviteUser[]>;
}

export default IRecoilAtom;
