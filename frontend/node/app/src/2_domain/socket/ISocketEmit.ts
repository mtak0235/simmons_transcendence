import SocketEmitDto from "SocketEmitDto";

abstract class ISocketEmit {
  public abstract changeStatus(data: SocketEmitDto.STATUS_LAYER);
  public abstract blockUser(data: number);
  public abstract followUser(data: number);
  public abstract unFollowUser(data: number);
  public abstract createChannel(data: SocketEmitDto.CreateChannel);
  public abstract updateChannel(data: SocketEmitDto.UpdateChannel);
  public abstract inChannel(data: SocketEmitDto.InChannel);
  public abstract outChannel();
  public abstract inviteUser(data: number);
  public abstract setAdmin(data: number);
  public abstract kickOutUser(data: number);
  public abstract muteUser(data: number);
  public abstract waitingGame();
  public abstract leaveGame();
  public abstract readyGame();
  public abstract sendMessage(data: string);
  public abstract sendDirectMessage(data: SocketEmitDto.DirectMessage);
  public abstract inputKey(data: SocketEmitDto.ChangeKeyPos);
}

export default ISocketEmit;
