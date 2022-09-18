import SocketDto from "SocketDto";

const Broad = {
  user: {
    changeStatus: (data: SocketDto.UserInfo) => {},
  },
  channel: {
    createChannel: (data: SocketDto.ChannelPublic) => {},
    updateChannel: (data: SocketDto.ChannelPublic) => {},
    deleteChannel: (data: number) => {},
    setAdmin: (data: {
      channelId: number;
      ownerId: number;
      adminId: number;
    }) => {},
  },
};

export default Broad;
