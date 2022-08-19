import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class WsGuard extends AuthGuard('ws') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('hello');
    return true;
  }
}
