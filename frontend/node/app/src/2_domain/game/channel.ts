type ChannelParam = {
  adminId: number;
  channelIdx: number;
  accessLayer: string;
  channelName: string;
  score: number;
  onGame: boolean;
};

class Channel {
  adminId: number;
  channelIdx: number;
  accessLayer: string;
  channelName: string;
  score: number;
  onGame: boolean;

  private constructor(param: ChannelParam) {
    this.adminId = param.adminId;
    this.channelIdx = param.channelIdx;
    this.accessLayer = param.accessLayer;
    this.channelName = param.channelName;
    this.score = param.score;
    this.onGame = param.onGame;
  }
  static fromJson = (json: any): Channel => {
    return new Channel({
      adminId: json["adminId"],
      channelIdx: json["channelIdx"],
      accessLayer: json["accessLayer"],
      channelName: json["channelName"],
      score: json("score"),
      onGame: json("onGame"),
    });
  };
}

export default Channel;
