import { atom, RecoilState } from "recoil";
import SocketDto from "SocketDto";

interface HandleAtom<T> {
  user: {
    me: RecoilState<SocketDto.User>;
    users: RecoilState<SocketDto.UserInfo[]>;
  };
  channel: {
    me: {
      channelPublic: RecoilState<SocketDto.ChannelPublic>;
      channelPrivate: RecoilState<SocketDto.ChannelPrivate>;
      message: RecoilState<SocketDto.ChannelMessage>;
    };
    channels: RecoilState<SocketDto.ChannelPublic[]>;
  };
  error: RecoilState<SocketDto.Error>;
  alarm: RecoilState<SocketDto.InviteUser[]>;
}

export const RecoilAtom: HandleAtom<any> = {
  user: {
    me: atom<SocketDto.User>({
      key: "broad:me",
      default: undefined,
    }),
    users: atom<SocketDto.UserInfo[]>({
      key: "broad:users",
      default: [],
    }),
  },
  channel: {
    me: {
      channelPublic: atom<SocketDto.ChannelPublic>({
        key: "channel:channelPublic",
        default: undefined,
      }),
      channelPrivate: atom<SocketDto.ChannelPrivate>({
        key: "channel:channelPrivate",
        default: undefined,
      }),
      message: atom<SocketDto.ChannelMessage>({
        key: "channel:message",
        default: undefined,
      }),
    },
    channels: atom<SocketDto.ChannelPublic[]>({
      key: "main:channel:channels",
      default: [],
    }),
  },
  error: atom<SocketDto.Error>({
    key: "broad:error",
    default: undefined,
  }),
  alarm: atom<SocketDto.InviteUser[]>({
    key: "broad:alarm",
    default: [],
  }),
};
