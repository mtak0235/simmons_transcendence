export class RoomDto {
  roomId: string;
  cheifId: string;
  roomName: string;
}

export class setInitDTO {
  nickname: string;
  room: {
    roomId: string;
    roomName: string;
  };
}

export const ACCESS_LAYER = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PROTECTED: 'protected',
} as const;
export type ACCESS_LAYER = typeof ACCESS_LAYER[keyof typeof ACCESS_LAYER];

export class ChannelDto {
  accessLayer: ACCESS_LAYER;
  channelName: string;
  score: number;
  adminID: string;
}

export class ChannelInfoDto {
  password?: string;
  channel: ChannelDto;
  game: Game;
}

export class UserDto {
  id:string;
  name:string;
}

export class Game {
  waiters:Queue<UserDto>;
  player: string[]
}

export interface ObjectType<T> {
  [key: number]: T;
}

export class Queue<T> {
  private _queue: ObjectType<T>;
  private _head: number;
  private _tail: number;

  constructor() {
    this._queue = {};
    this._head = 0;
    this._tail = 0;
  }

  get isEmpty() {
    return this.size === 0;
  }

  get size() {
    return this._tail - this._head;
  }

  enqueue(value: T): void {
    this._queue[this._tail] = value;
    this._tail++;
  }

  dequeue(): T {
    if (this.isEmpty) {
      return undefined;
    }
    const value = this._queue[this._head];
    delete this._queue[this._head];
    this._head++;
    return value;
  }

  peek(): T {
    if (this.isEmpty) {
      return undefined;
    }
    return this._queue[this._head];
  }

  clear(): void {
    this._queue = {};
    this._head = 0;
    this._tail = 0;
  }

  print(): string {
    if (this.isEmpty) {
      return '';
    }
    let values = [];
    for (let i = this._head; i < this._tail; i++) {
      values.unshift(this._queue[i].toString());
    }
    return values.join(' -> ');
  }
}