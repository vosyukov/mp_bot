import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
const asyncLocalStorage = new AsyncLocalStorage();
import { v4 } from 'uuid';
import { Observable } from 'rxjs';

export interface Store {
  requestId: string;
}

@Injectable()
export class RequestContextService {
  public init<T>(func: () => Promise<T>): Promise<T> {
    return asyncLocalStorage.run(
      {
        requestId: v4(),
      },
      func,
    );
  }

  public getStore(): Store {
    return asyncLocalStorage.getStore() as Store;
  }

  public getRequestId(): string {
    return this.getStore().requestId;
  }
}
