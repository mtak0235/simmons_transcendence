declare module "SocketEmitDto" {
  import SocketDto from "SocketDto";
  namespace SocketEmitDto {
    type STATUS_LAYER = SocketDto.STATUS_LAYER;
    type ACCESS_LAYER = SocketDto.ACCESS_LAYER;

    interface CreateChannel {
      ownerId: number;
      channelName: string;
      password?: string;
      accessLayer: string;
      score: number;
    }

    interface UpdateChannel {
      channel: {
        channelName?: string;
        accessLayer?: string;
        score?: number;
      };
      password?: string;
    }

    interface InChannel {
      channelId: number;
      password?: string;
    }

    interface DirectMessage {
      targetId: number;
      message: string;
    }

    interface ChangeKeyPos {
      keyCode: number;
      userIdx: number;
    }
  }

  export default SocketEmitDto;
}
