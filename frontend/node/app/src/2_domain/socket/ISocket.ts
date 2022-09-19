import * as io from "socket.io-client";
import {
  EventNames,
  EventParams,
  EventsMap,
  ReservedOrUserEventNames,
  ReservedOrUserListener,
} from "@socket.io/component-emitter";

abstract class ISocket<
  ListenEvents extends EventsMap,
  EmitEvents extends EventsMap,
  ReservedEvents extends EventsMap = {}
> {
  abstract socket?: io.Socket;

  public abstract connect(): void;

  public abstract on<
    Ev extends ReservedOrUserEventNames<ReservedEvents, ListenEvents>
  >(
    ev: string,
    listener: ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>
  ): void;

  public abstract emit<Ev extends EventNames<EmitEvents>>(
    ev: string,
    ...args: EventParams<EmitEvents, Ev>
  ): void;

  public abstract reRender(): void;
}

export default ISocket;
