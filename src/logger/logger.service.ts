import { Inject, Injectable, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ClsService } from 'nestjs-cls';

interface ILoggerMetadata {
  error?: Error;
  context: string;
  requestId?: string;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly cls: ClsService,
  ) {
    this.context = 'Application';
  }

  setContext(context: string) {
    this.context = context;
  }

  error(error: Error, msg = '') {
    this.logger.error(msg, {
      error,
      context: this.context,
      requestId: this.cls.get('requestId'),
    });
  }

  info<T>(msg: string, logData?: T) {
    const message =
      msg + (logData ? '\n' + JSON.stringify(logData, null, 2) : '');
    this.logger.info(message, {
      context: this.context,
      requestId: this.cls.get('requestId'),
    });
  }

  warn(msg: string, error?: Error) {
    const meta: ILoggerMetadata = {
      context: this.context,
      requestId: this.cls.get('requestId'),
    };
    if (error) meta.error = error;

    this.logger.warn(msg, meta);
  }
}
