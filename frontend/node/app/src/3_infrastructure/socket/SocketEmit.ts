import ISocketEmit from "@domain/socket/ISocketEmit";
import ISocket from "@domain/socket/ISocket";
import Get from "@root/lib/di/get";
import SocketEmitDto from "SocketEmitDto";

class SocketEmit extends ISocketEmit {
  socket: ISocket<any, any> = Get.get("ISocket");

  // user
  public changeStatus(data: SocketEmitDto.STATUS_LAYER) {
    this.socket.emit("changeStatus", { status: data });
  }
  public blockUser(data: number) {
    this.socket.emit("blockUser", { userId: data });
  }
  public followUser(data: number) {
    this.socket.emit("followUser", { userId: data });
  }
  public unFollowUser(data: number) {
    this.socket.emit("unFollowUser", { userId: data });
  }

  // channel
  public createChannel(data: SocketEmitDto.CreateChannel) {
    this.socket.emit("createChannel", { channel: data });
  }
  public updateChannel(data: SocketEmitDto.UpdateChannel) {
    this.socket.emit("modifyChannel", { ...data });
  }
  public inChannel(data: SocketEmitDto.InChannel) {
    this.socket.emit("inChannel", { ...data });
  }
  public outChannel() {
    this.socket.emit("outChannel");
  }
  public inviteUser(data: number) {
    this.socket.emit("inviteUser", { userId: data });
  }
  public setAdmin(data: number) {
    this.socket.emit("setAdmin", { userId: data });
  }
  public kickOutUser(data: number) {
    this.socket.emit("kickOutUser", { userId: data });
  }
  public muteUser(data: number) {
    this.socket.emit("muteUser", { userId: data });
  }
  public waitingGame() {
    this.socket.emit("waitingGame");
  }
  public leaveGame() {
    this.socket.emit("leaveGame");
  }
  public readyGame() {
    this.socket.emit("readyGame");
  }
  // endGame (data: any)  {
  // this.socket.emit("inChannel", data);}
  public sendMessage(data: string) {
    this.socket.emit("sendMessage", { message: data });
  }
  public sendDirectMessage(data: SocketEmitDto.DirectMessage) {
    this.socket.emit("sendDirectMessage", { ...data });
  }
}

export default SocketEmit;
