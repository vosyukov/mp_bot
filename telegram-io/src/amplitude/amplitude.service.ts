import { Injectable } from '@nestjs/common';
import { init, NodeClient, Event } from '@amplitude/node';

@Injectable()
export class AmplitudeService {
  private client: NodeClient;
  constructor() {
    this.client = init('2bfe84e3118239d46515f930b3efe9a3');
  }

  public async logEvent(event: Event): Promise<any> {
    return await this.client.logEvent(event);
  }
}
