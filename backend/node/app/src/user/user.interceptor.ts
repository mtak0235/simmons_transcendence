import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { UserResponseDto } from '@user/user.dto';

@Injectable()
export class UserResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((result: UserResponseDto) => {
        const res = context.switchToHttp().getResponse();

        res.status(result.status).json(result.body);
      }),
    );
  }
}
