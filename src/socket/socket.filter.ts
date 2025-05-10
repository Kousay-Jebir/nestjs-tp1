import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const error = exception.getError();

    client.emit('validation-error', {
      status: 'validation error',
      errors: Array.isArray(error)
        ? error.map((e) => `${e.field}: ${e.message}`)
        : [error],
    });
  }
}
