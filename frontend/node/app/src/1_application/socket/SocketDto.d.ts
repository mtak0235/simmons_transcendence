// todo: Domain으로 뺄 코드들 들어있는 공간임

declare module "SocketDto" {
  namespace SocketDto {
    const STATUS_LAYER = {
      inGame: "inGame",
      waitingGame: "waitingGame",
      watchingGame: "watchingGame",
      online: "online",
      offline: "offline",
    } as const;

    const ACCESS_LAYER = {
      PUBLIC: "public",
      PRIVATE: "private",
      PROTECTED: "protected",
    } as const;

    const MESSAGE_LAYER = {};

    type STATUS_LAYER = typeof STATUS_LAYER[keyof typeof STATUS_LAYER];
    type ACCESS_LAYER = typeof ACCESS_LAYER[keyof typeof ACCESS_LAYER];

    interface UserInfo {
      userId: number;
      username: string;
      status: STATUS_LAYER;
    }

    interface User extends UserInfo {
      follows: Array<number>;
      blocks: Array<number>;
    }

    interface MutedUser {
      userId: number;
      expiredAt: number;
    }

    interface Matcher {
      userId: number;
      isReady: boolean;
    }

    interface ChannelPublic {
      adminId: number;
      ownerId: number;
      channelId: number;
      accessLayer: ACCESS_LAYER;
      channelName: string;
      score: number;
      onGame: boolean;
    }

    interface ChannelPrivate {
      users: number[];
      waiter: number[];
      matcher: Matcher[];
    }

    interface ChannelSingle {
      channelPublic: ChannelPublic;
      channelPrivate: ChannelPrivate;
    }

    interface Channel {
      channelPublic: ChannelPublic;
      channelPrivate: ChannelPrivate;
      kickedOutUsers: number[];
      mutedUsers: MutedUser[];
      invited: number[];
    }

    interface ChannelMessage {
      sourceId: number;
      targetId?: number;
      username: string;
      message: string;
      time: string;
    }

    interface Connection {
      me: User;
      users: UserInfo[];
      channels: ChannelPublic[];
    }

    interface Error {
      status: number;
      message: string;
    }

    interface InviteUser {
      userId: number;
      channelId: number;
      channelName: string;
    }

    interface MuteUser {
      userId: number;
      expiredAt: number;
    }

    interface GameQueue {
      matcher: Matcher[];
      waiter: number[];
    }

    interface Message {
      userId: number;
      message: string;
    }

    interface DirectMessage {
      sourceId: number;
      targetId: number;
      message: string;
    }

    interface ChannelAdmin {
      channelId: number;
      adminId: number;
      ownerId: number;
    }
  }
  export default SocketDto;
}
