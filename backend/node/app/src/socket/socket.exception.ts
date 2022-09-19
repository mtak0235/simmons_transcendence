import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { ClientInstance } from '@socket/socket.gateway';

interface ErrorDto {
  status: number;
  message: string;
  stack?: string | object;
}

export class SocketException extends WsException {
  constructor(error: string) {
    super('client');
    this.message = error;
  }
}

// todo: Custom Exception 만들자
@Catch()
export class SocketExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: HttpException | any, host: ArgumentsHost) {
    const client: ClientInstance = host.switchToWs().getClient();
    let error: ErrorDto;

    console.log(exception);
    if (exception instanceof HttpException) {
      error = {
        status: exception.getStatus(),
        message: exception.message,
      };
    } else {
      // todo: 이 경우 로깅 해야함
      error = {
        status: 500,
        message: 'Internal Server Error',
      };
    }

    client.emit('single:user:error', error);
  }
}
