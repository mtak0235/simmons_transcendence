import { RecoilState, RecoilValueReadOnly } from "recoil";
import SocketDto from "SocketDto";

interface IRecoilSelector {
  user: {
    me: RecoilValueReadOnly<SocketDto.User>;
    users: RecoilValueReadOnly<SocketDto.UserInfo[]>;
    status: RecoilValueReadOnly<SocketDto.UserInfo>;
    onFollows: RecoilValueReadOnly<SocketDto.UserInfo[]>;
  };
  channel: {
    channels: RecoilValueReadOnly<SocketDto.ChannelPublic[]>;
    public: RecoilValueReadOnly<SocketDto.ChannelPublic>;
    private: RecoilValueReadOnly<SocketDto.ChannelPrivate>;
    message: RecoilValueReadOnly<SocketDto.ChannelMessage>;
  };
  error: RecoilValueReadOnly<SocketDto.Error>;
  alarm: RecoilValueReadOnly<SocketDto.InviteUser[]>;
}

export default IRecoilSelector;
