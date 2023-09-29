import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { LoggerService } from '@/logger/logger.service';
import { TypeORMError } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LogErrorInterceptor implements NestInterceptor {
  constructor(
    private readonly log: LoggerService,
    private readonly cls: ClsService,
  ) {
    this.log.setContext(LogErrorInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.cls.set('requestId', uuidv4());
    return next.handle().pipe(
      catchError((err) => {
        this.cls.set('error', err);
        if (!(err instanceof HttpException || err instanceof TypeORMError)) {
          this.log.error(err);
        }
        throw err;
      }),
    );
  }
}
