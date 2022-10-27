import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { ClientInstance } from '@socket/socket.gateway';

interface ExceptionParams {
  status: number;
  message: string;
  event?: string;
  stack?: string;
}

export class SocketException {
  status: number;
  message: string;
  event?: string;

  constructor(status: number, message: string, stack?: string) {
    this.status = status;
    this.message = message;
    this.event = status !== 500 ? this.getEvent(stack) : undefined;

    // todo: status 500 인 경우 로깅 할까?
  }

  getEvent(stack: string): string {
    // const reg = new RegExp(process.env.PWD + '/src/socket/socket.gateway.ts');
    const eventLine = stack.split('\n')[1].split('at ')[1].split('.');
    const exceptionRoot = eventLine[0];

    if (exceptionRoot !== 'SocketGateway') return exceptionRoot;

    return eventLine[1].split(' ')[0];
  }
}

@Catch()
export class SocketExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: HttpException | any, host: ArgumentsHost) {
    const client: ClientInstance = host.switchToWs().getClient();
    let error: SocketException;

    console.log(exception);
    if (exception instanceof HttpException) {
      error = new SocketException(
        exception.getStatus(),
        exception.message,
        exception.stack,
      );
    } else {
      // todo: 이 경우 로깅 해야함
      error = new SocketException(
        500,
        'Internal Server Error',
        exception.stack,
      );
    }
    console.log(exception);
    console.log(error);

    client.emit('single:user:error', error);
  }
}
