import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class PersistenceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('input::');
    // console.log(context.switchToWs().getClient());
    // console.log('before....');
    // const sessionID = socket.handshake.auth.sessionID;
    // if (sessionID) {
    //   // find existing session
    //   const session = sessionStore.findSession(sessionID);
    //   if (session) {
    //     socket.sessionID = sessionID;
    //     socket.userID = session.userID;
    //     socket.username = session.username;
    //     return next();
    //   }
    // }
    // const username = socket.handshake.auth.username;
    // if (!username) {
    //   return next(new Error('invalid username'));
    // }
    // // create new session
    // socket.sessionID = randomId();
    // socket.userID = randomId();
    // socket.username = username;
    return next.handle().pipe(tap((data) => console.log('output')));
  }
}
