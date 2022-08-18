import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SocketGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let wsArgumentsHost = context.switchToWs();
    let client = wsArgumentsHost.getClient();
    let data = wsArgumentsHost.getData();

    return true;
  }
}
