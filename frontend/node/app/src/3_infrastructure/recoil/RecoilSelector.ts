import { selector, selectorFamily } from "recoil";
import SocketDto from "SocketDto";
import RecoilAtom from "@infrastructure/recoil/RecoilAtom";
import IRecoilSelector from "@domain/recoil/IRecoilSelector";
import { v1 } from "uuid";
import { recoilUsers } from "@presentation/components/SocketHandler";

export const selectorUsers = selector({
  key: `selector:user:users11/${v1()}`,
  get: ({ get }) => get(recoilUsers),
});

const RecoilSelector: IRecoilSelector = {
  user: {
    me: selector({
      key: `selector:user:me/${v1()}`,
      get: ({ get }) => get(RecoilAtom.user.me),
    }),
    users: selector({
      key: `selector:user:users/${v1()}`,
      get: ({ get }) => get(RecoilAtom.user.users),
    }),
    status: selector({
      key: `selector:user:status/${v1()}`,
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
      key: `selector:user:onFollows/${v1()}`,
      get: ({ get }): SocketDto.UserInfo[] => {
        const me = get(RecoilAtom.user.me);
        const users = get(RecoilAtom.user.users);
        return users.filter((user) => me.follows.indexOf(user.userId) !== -1);
      },
    }),
    newUser: selector({
      key: `selector:user:newUser/${v1()}`,
      get: ({ get }): SocketDto.UserInfo => {
        const users = get(RecoilAtom.user.users);
        return users[users.length - 1];
      },
    }),
  },
  channel: {
    channels: selector({
      key: `selector:channel:channels/${v1()}`,
      get: ({ get }) => get(RecoilAtom.channel.channels),
    }),
    public: selector({
      key: `selector:channel:public/${v1()}`,
      get: ({ get }) => get(RecoilAtom.channel.channelPublic),
    }),
    private: selector({
      key: `selector:channel:private/${v1()}`,
      get: ({ get }) => get(RecoilAtom.channel.channelPrivate),
    }),
    message: selector({
      key: `selector:channel:message/${v1()}`,
      get: ({ get }) => get(RecoilAtom.channel.message),
    }),
  },
  error: selector({
    key: `selector:error/${v1()}`,
    get: ({ get }) => get(RecoilAtom.error),
  }),
  alarm: selector({
    key: `selector:alarm/${v1()}`,
    get: ({ get }) => get(RecoilAtom.alarm),
  }),
};

export default RecoilSelector;
