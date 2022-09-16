import * as io from "socket.io-client";
import { Cookies } from "react-cookie";
import {
  EventNames,
  EventParams,
  EventsMap,
  ReservedOrUserEventNames,
  ReservedOrUserListener,
} from "@socket.io/component-emitter";
import ISocket from "@domain/socket/ISocket";

class Socket<
  ListenEvents extends EventsMap,
  EmitEvents extends EventsMap,
  ReservedEvents extends EventsMap = {}
> extends ISocket<any, any> {
  private readonly cookies = new Cookies();
  socket?: io.Socket;

  public connect(): void {
    this.socket = io.connect("http://localhost:4000", {
      withCredentials: true,
      extraHeaders: {
        access_token: this.cookies.get("access_token"),
      },
    });
    console.log(this.socket);
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
    this.socket?.emit(ev, ...args);
  }

  public reRender(): void {
    this.socket?.removeAllListeners();
  }
}

export default Socket;
