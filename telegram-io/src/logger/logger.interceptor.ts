import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, mergeMap, of, tap } from 'rxjs';
type TelegrafContext = any;

import { LoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService, private readonly requestContextService: RequestContextService) {}
  intercept(context: ExecutionContext, next: CallHandler): any {
    if (context.getType() === 'http') {
      // do something that is only important in the context of regular HTTP requests (REST)
    } else if (context.getType() === 'rpc') {
      // do something that is only important in the context of Microservice requests
    } else if (context.getType<TelegrafContext>() === ' telegraf') {
      // do something that is only important in the context of GraphQL requests
    }

    const s$ = of(null).pipe(
      tap(() =>
        this.loggerService.info({
          type: 'request',

          contextType: context.getType(),
          method: context.getHandler().name,
          args: context.getArgs(),
        }),
      ),
      mergeMap(() => next.handle()),
      tap((result) =>
        this.loggerService.info({
          type: 'response',
          response: result,
        }),
      ),
      catchError((err) => {
        this.loggerService.error({
          error: err,
        });

        throw err;
      }),
    );

    return this.requestContextService.init<any>(() => s$.toPromise());
  }
}
