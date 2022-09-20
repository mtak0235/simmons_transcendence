import { atom, RecoilState, RecoilValueReadOnly, selector } from "recoil";
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
  alarm: RecoilState<SocketDto.InviteUser>;
}

export const RecoilAtom: IRecoilAtom<any> = {
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

export const RecoilSelector = {
  user: {
    me: selector({
      key: "selector:user:me",
      get: ({ get }) => get(RecoilAtom.user.me),
    }),
    users: selector({
      key: "selector:user:users",
      get: ({ get }) => get(RecoilAtom.user.users),
    }),
    status: selector({
      key: "selector:user:status",
      get: ({ get }): SocketDto.UserInfo => {
        const user = get(RecoilAtom.user.me);
        return {
          userId: user.userId,
          username: user.username,
          status: user.status,
        };
      },
    }),
    onFollows: selector({
      key: "selector:user:onFollows",
      get: ({ get }): SocketDto.UserInfo[] => {
        const follows = get(RecoilAtom.user.me).follows;
        const users = get(RecoilAtom.user.users);
        return users.filter((user) => follows.indexOf(user.userId) !== -1);
      },
    }),
  },
  channel: {
    channels: selector({
      key: "selector:channel:channels",
      get: ({ get }) => get(RecoilAtom.channel.channels),
    }),
    public: selector({
      key: "selector:channel:public",
      get: ({ get }) => get(RecoilAtom.channel.channelPublic),
    }),
    private: selector({
      key: "selector:channel:private",
      get: ({ get }) => get(RecoilAtom.channel.channelPrivate),
    }),
    message: selector({
      key: "selector:channel:message",
      get: ({ get }) => get(RecoilAtom.channel.message),
    }),
  },
  error: selector({
    key: "selector:error",
    get: ({ get }) => get(RecoilAtom.error),
  }),
  alarm: selector({
    key: "selector:alarm",
    get: ({ get }) => get(RecoilAtom.alarm),
  }),
};
