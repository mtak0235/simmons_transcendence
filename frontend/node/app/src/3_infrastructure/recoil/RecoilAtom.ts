import { atom, RecoilState } from "recoil";
import SocketDto from "SocketDto";
import IRecoilAtom from "@domain/recoil/IRecoilAtom";
import { v1 } from "uuid";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
  key: "something",
});

// export const userMe = atom<SocketDto.User>({
//   key: `broad:me/${v1()}`,
//   default: {
//     userId: 0,
//     username: "",
//     status: "offline",
//     follows: [],
//     blocks: [],
//   },
// });
//
// export const recoilUsers = atom<SocketDto.UserInfo[]>({
//   key: `broad:users1/${v1()}`,
//   default: [],
//   effects_UNSTABLE: [persistAtom],
// });

const RecoilAtom = {
  user: {
    me: atom<SocketDto.User>({
      key: `broad:me2/${v1()}`,
      default: undefined,
    }),
    users: atom<SocketDto.UserInfo[]>({
      key: `broad:users/${v1()}`,
      default: [],
    }),
  },
  channel: {
    channelPublic: atom<SocketDto.ChannelPublic>({
      key: `channel:channelPublic/${v1()}`,
      default: undefined,
    }),
    channelPrivate: atom<SocketDto.ChannelPrivate>({
      key: `channel:channelPrivate/${v1()}`,
      default: undefined,
    }),
    message: atom<SocketDto.ChannelMessage>({
      key: `channel:message/${v1()}`,
      default: undefined,
    }),

    channels: atom<SocketDto.ChannelPublic[]>({
      key: `main:channel:channels/${v1()}`,
      default: [],
    }),
  },
  error: atom<SocketDto.Error>({
    key: `broad:error/${v1()}`,
    default: undefined,
  }),
  alarm: atom<SocketDto.InviteUser[]>({
    key: `broad:alarm/${v1()}`,
    default: [],
  }),
};

export default RecoilAtom;
