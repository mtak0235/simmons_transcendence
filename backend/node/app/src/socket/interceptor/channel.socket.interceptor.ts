import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientInstance } from '@socket/socket.gateway';

@Injectable()
export class HasChannelInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const client: ClientInstance = context.switchToWs().getClient();

    if (client.channel) throw new BadRequestException();

    return next.handle();
  }
}

export const ChannelInterceptors = [HasChannelInterceptor];
