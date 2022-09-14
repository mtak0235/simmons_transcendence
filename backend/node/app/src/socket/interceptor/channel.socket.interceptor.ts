import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientInstance } from '@socket/socket.gateway';

export class ChannelInterceptor implements NestInterceptor {
  private readonly hasChannel: boolean;
  private readonly requireAdmin: boolean;
  private readonly requireOwner: boolean;

  constructor(
    hasChannel: boolean,
    requireAdmin: boolean,
    requireOwner = false,
  ) {
    this.hasChannel = hasChannel;
    this.requireAdmin = requireAdmin;
    this.requireOwner = requireOwner;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const client: ClientInstance = context.switchToWs().getClient();

    if (this.hasChannel && !client.channel) {
      throw new ForbiddenException();
    } else if (!this.hasChannel && client.channel) {
      throw new ForbiddenException();
    }

    if (
      (this.requireAdmin &&
        client.channel.channelPublic.adminId !== client.user.userId) ||
      (this.requireOwner &&
        client.channel.channelPublic.ownerId !== client.user.userId)
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

    const mutedUser = client.channel.mutedUsers.filter(
      (user) => user.userId === client.user.userId,
    );

    if (mutedUser.length !== 0) {
      if (mutedUser[0].expiredAt >= new Date().getDate())
        throw new ForbiddenException();
      else mutedUser.slice(0);
    }

    return next.handle();
  }
}

export const ChannelInterceptors = [
  ChannelInterceptor,
  ChannelMessageInterceptor,
];
