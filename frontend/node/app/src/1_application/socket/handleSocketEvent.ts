import SocketDto from "SocketDto";

interface HandleEvent<T> {
  single?: T;
  group?: T;
  broad?: T;
}

const UserEvent: HandleEvent<any> = {
  single: {
    connected: (data: SocketDto.ConnectedAt) => {},
    error: (data: SocketDto.Error) => {},
    blockUser: (data: number) => {},
    followUser: (data: number) => {},
    followedUser: (data: number) => {},
    unfollowUser: (data: number) => {},
  },
  broad: {
    changeStatus: (data: SocketDto.UserInfo) => {},
  },
};

const ChannelEvent: HandleEvent<any> = {
  single: {
    createChannel: (data: SocketDto.ChannelSingle) => {},
    inChannel: (data: SocketDto.ChannelSingle) => {},
    outChannel: (data: number) => {},
    inviteUser: (data: SocketDto.InviteUser) => {},
    kickOut: () => {}, // todo: delete
  },
  group: {
    inChannel: (data: number) => {},
    outChannel: (data: number) => {},
    kickOut: (data: number) => {},
    muteUser: (data: SocketDto.MuteUser) => {},
    waitingGame: (data: SocketDto.GameQueue) => {},
    leaveGame: (data: SocketDto.GameQueue) => {},
    readyGame: (data: SocketDto.Matcher[]) => {},
    // todo: startGame, endGame, ...Game events
    sendMessage: (data: SocketDto.Message) => {},
    sendDirectMessage: (data: SocketDto.DirectMessage) => {},
  },
  broad: {
    createChannel: (data: SocketDto.ChannelPublic) => {},
    updateChannel: (data: SocketDto.ChannelPublic) => {},
    deleteChannel: (data: number) => {},
    setAdmin: (data: SocketDto.ChannelAdmin) => {},
  },
};

export { UserEvent, ChannelEvent };
