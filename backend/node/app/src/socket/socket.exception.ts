import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { ArgumentsHost, Catch } from '@nestjs/common';
import { Client } from '@socket/socket.gateway';

export class SocketException extends WsException {
  constructor(error: string) {
    super('client');
    this.message = error;
  }
}

@Catch()
export class SocketExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: SocketException | any, host: ArgumentsHost) {
    const client: Client = host.switchToWs().getClient();
    let error: SocketException | any = exception;

    // todo: 이 경우 로깅 해야함
    if (!(exception instanceof SocketException)) {
      error = {
        error: 'server',
        message: exception.message,
      };
    }

    client.emit('customError', error);
  }
}
