import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

import { UserResponseDto } from '@user/user.dto';

@Injectable()
export class UserResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((result: UserResponseDto) => {
        context.switchToHttp().getResponse().status(result.status);

        return result.body;
      }),
    );
  }
}
