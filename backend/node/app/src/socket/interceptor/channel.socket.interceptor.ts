import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientInstance } from '@socket/socket.gateway';

interface ChannelAuthInterceptorParam {
  hasChannel?: boolean;
  admin?: boolean;
  owner?: boolean;
  matcher?: boolean;
  onGame?: boolean;
}

// todo: create: ChannelGameInterceptor 만들어야함

export class ChannelAuthInterceptor implements NestInterceptor {
  private readonly hasChannel: boolean;
  private readonly admin: boolean;
  private readonly owner: boolean;
  private readonly matcher: boolean;

  // todo: 게임 중인 사람인지 확인하는 flag 세워야함

  constructor(param: ChannelAuthInterceptorParam = {}) {
    this.hasChannel = param.hasChannel ? param.hasChannel : true;
    this.admin = param.admin ? param.admin : false;
    this.owner = param.owner ? param.owner : false;
    this.matcher = param.matcher ? param.matcher : false;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const client: ClientInstance = context.switchToWs().getClient();

    if (
      (this.hasChannel && !client.channel) ||
      (!this.hasChannel && client.channel)
    ) {
      throw new ForbiddenException();
    }

    if (
      client.channel.channelPublic.onGame ||
      (this.admin &&
        client.channel.channelPublic.adminId !== client.user.userId &&
        client.channel.channelPublic.ownerId !== client.user.userId) ||
      (this.owner &&
        client.channel.channelPublic.ownerId !== client.user.userId) ||
      (this.matcher &&
        [
          ...client.channel.channelPrivate.matcher.filter(
            (user) => user.userId === client.user.userId,
          ),
        ].length !== 1)
    )
      throw new ForbiddenException();

    return next.handle();
  }
}

@Injectable()
export class ChannelMessageInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const client: ClientInstance = context.switchToWs().getClient();

    client.channel.mutedUsers.map((user, idx) => {
      if (user.userId === client.user.userId) {
        if (user.expiredAt >= Math.floor(new Date().getTime() / 1000)) {
          throw new ForbiddenException();
        } else {
          client.channel.mutedUsers.slice(idx, 1);
        }
      }
    });

    return next.handle();
  }
}

export const ChannelInterceptors = [
  ChannelAuthInterceptor,
  ChannelMessageInterceptor,
];
