import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export class SocketBodyCheckInterceptor implements NestInterceptor {
  private readonly keys: string[];

  constructor(...keys: string[]) {
    this.keys = keys;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const body: string | object = context.switchToWs().getData();

    if (typeof body != 'object') throw new BadRequestException();

    for (const key of this.keys)
      if (!body.hasOwnProperty(key)) throw new BadRequestException();

    return next.handle();
  }
}
