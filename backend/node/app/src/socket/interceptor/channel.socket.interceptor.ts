import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientInstance } from '@socket/socket.gateway';

export class ChannelInterceptor implements NestInterceptor {
  private readonly hasChannel: boolean;
  private readonly requireAdmin: boolean;

  constructor(hasChannel: boolean, requireAdmin: boolean) {
    this.hasChannel = hasChannel;
    this.requireAdmin = requireAdmin;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const client: ClientInstance = context.switchToWs().getClient();

    if (this.hasChannel && !client.channel) {
      throw new BadRequestException();
    } else if (!this.hasChannel && client.channel) {
      throw new BadRequestException();
    }

    if (
      this.requireAdmin &&
      client.channel.channelInfo.adminId !== client.user.userId
    )
      throw new BadRequestException();

    return next.handle();
  }
}

export const ChannelInterceptors = [ChannelInterceptor];
