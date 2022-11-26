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
export class DoesNotAccessOnGame implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const client: ClientInstance = context.switchToWs().getClient();

    if (client.channel.channelPublic.onGame) throw new BadRequestException();

    return next.handle();
  }
}

export const GameInterceptors = [DoesNotAccessOnGame];
