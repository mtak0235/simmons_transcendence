import { RecoilState, RecoilValueReadOnly } from "recoil";
import SocketDto from "SocketDto";

interface IRecoilSelector {
  user: {
    me: RecoilValueReadOnly<SocketDto.User>;
    users: RecoilValueReadOnly<SocketDto.UserInfo[]>;
    status: RecoilValueReadOnly<SocketDto.UserInfo>;
    onFollows: RecoilValueReadOnly<SocketDto.UserInfo[]>;
    newUser: RecoilValueReadOnly<SocketDto.UserInfo>;
  };
  channel: {
    channels: RecoilValueReadOnly<SocketDto.ChannelPublic[]>;
    public: RecoilValueReadOnly<SocketDto.ChannelPublic>;
    private: RecoilValueReadOnly<SocketDto.ChannelPrivate>;
    message: RecoilValueReadOnly<SocketDto.ChannelMessage>;
  };
  game: {
    round: RecoilValueReadOnly<number>;
    onGame: RecoilValueReadOnly<boolean>;
    onRound: RecoilValueReadOnly<boolean>;
    matcher: RecoilValueReadOnly<SocketDto.GameMatcherInfoDto[]>;
    ball: RecoilValueReadOnly<number>;
  };
  error: RecoilValueReadOnly<SocketDto.Error>;
  alarm: RecoilValueReadOnly<SocketDto.InviteUser[]>;
}

export default IRecoilSelector;
