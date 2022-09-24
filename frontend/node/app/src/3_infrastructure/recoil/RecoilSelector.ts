import { selector } from "recoil";
import SocketDto from "SocketDto";
import RecoilAtom from "@infrastructure/recoil/RecoilAtom";
import IRecoilSelector from "@domain/recoil/IRecoilSelector";

const RecoilSelector: IRecoilSelector = {
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
    newUser: selector({
      key: "selector:user:newUser",
      get: ({ get }): SocketDto.UserInfo => {
        const users = get(RecoilAtom.user.users);
        return users[users.length - 1];
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

export default RecoilSelector;
