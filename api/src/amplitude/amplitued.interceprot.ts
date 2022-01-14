import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { from, mergeMap, Observable } from 'rxjs';
import { AmplitudeService } from './amplitude.service';

@Injectable()
export class AmplitudeInterceptor implements NestInterceptor {
  constructor(private readonly amplitudeService: AmplitudeService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcMethod = context.getArgByIndex(1)?.args[0];
    const params = context.getArgByIndex(0);
    const userTgId = params?.userTgId;

    return from(this.amplitudeService.logEvent({ event_type: rpcMethod, user_id: userTgId, event_properties: params })).pipe(
      mergeMap(() => next.handle()),
    );
  }
}
