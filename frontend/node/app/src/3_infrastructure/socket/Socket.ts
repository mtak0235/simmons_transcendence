import * as io from "socket.io-client";
import {
  EventNames,
  EventParams,
  EventsMap,
  ReservedOrUserEventNames,
  ReservedOrUserListener,
} from "@socket.io/component-emitter";
import ISocket from "@domain/socket/ISocket";
import { IHttp } from "@domain/http/IHttp";
import Get from "@root/lib/di/get";

class Socket<
  ListenEvents extends EventsMap,
  EmitEvents extends EventsMap,
  ReservedEvents extends EventsMap = {}
> extends ISocket<any, any> {
  socket?: io.Socket;

  public async connect() {
    this.socket = io.connect(process.env.REACT_APP_SOCKET_URL, {
      extraHeaders: {
        access_token: localStorage.getItem("accessToken"),
      },
    });

    return true;
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  public on<Ev extends ReservedOrUserEventNames<ReservedEvents, ListenEvents>>(
    ev: string,
    listener: ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>
  ): void {
    this.socket?.on(ev, listener);
  }

  public emit<Ev extends EventNames<EmitEvents>>(
    ev: string,
    ...args: EventParams<EmitEvents, Ev>
  ): void {
    console.log(this.socket?.emit(ev, ...args));
  }

  public reRender(): void {
    this.socket?.removeAllListeners();
  }

  public connected(): boolean {
    return this.socket !== undefined;
  }
}

export default Socket;
