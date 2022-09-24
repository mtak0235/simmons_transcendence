import { atom, RecoilState } from "recoil";
import SocketDto from "SocketDto";
import IRecoilAtom from "@domain/recoil/IRecoilAtom";

const RecoilAtom: IRecoilAtom<any> = {
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

export default RecoilAtom;
