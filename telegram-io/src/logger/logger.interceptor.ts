import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, from, mergeMap, Observable, of, tap } from 'rxjs';
type TelegrafContext = any;
const safeJsonStringify = require('safe-json-stringify');
import { v4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';
const asyncLocalStorage = new AsyncLocalStorage();

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
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
          tap(() => {
            console.log(
              safeJsonStringify({
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                requestId: requestId,
                request: {
                  contextType: context.getType(),
                  method: context.getHandler().name,
                  args: context.getArgs(),
                },
                date: new Date(),
              }),
            );
          }),
          mergeMap(() => next.handle()),
          tap((result) =>
            console.log({
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              requestId: requestId,
              response: safeJsonStringify(result),
              date: new Date(),
            }),
          ),
          catchError((err) => {
            console.error(
              safeJsonStringify({
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // requestId: asyncLocalStorage.getStore().get('correlationId'),
                error: err,
              }),
            );
            throw err;
          }),
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // asyncLocalStorage.getStore().set('requestId', v4());
        return s$;
      },
    );
  }
}
