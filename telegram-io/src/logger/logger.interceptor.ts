import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, from, mergeMap, Observable, of, tap } from 'rxjs';
type TelegrafContext = any;
const safeJsonStringify = require('safe-json-stringify');
import { v4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';
import { LoggerService } from './logger.service';
const asyncLocalStorage = new AsyncLocalStorage();

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): any {
    if (context.getType() === 'http') {
      // do something that is only important in the context of regular HTTP requests (REST)
    } else if (context.getType() === 'rpc') {
      // do something that is only important in the context of Microservice requests
    } else if (context.getType<TelegrafContext>() === ' telegraf') {
      // do something that is only important in the context of GraphQL requests
    }

    return asyncLocalStorage.run<any, any>(
      {
        requestId: v4(),
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      () => {
        const requestId = asyncLocalStorage.getStore()['requestId'];
        const s$ = of(null).pipe(
          tap(() =>
            this.loggerService.info({
              requestId: requestId,
              type: 'request',
              request: {
                contextType: context.getType(),
                method: context.getHandler().name,
                args: context.getArgs(),
              },
              date: new Date(),
            }),
          ),
          mergeMap(() => next.handle()),
          tap((result) =>
            this.loggerService.info({
              type: 'response',
              requestId: requestId,
              response: result,
              date: new Date(),
            }),
          ),
          catchError((err) => {
            this.loggerService.info({
              type: 'error',
              requestId: requestId,
              error: err,
            });

            throw err;
          }),
        );

        return s$;
      },
    );
  }
}
