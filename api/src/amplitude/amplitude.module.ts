import { AmplitudeService } from './amplitude.service';
import { Global, Module } from '@nestjs/common';
import { AmplitudeInterceptor } from './amplitued.interceprot';

@Global()
@Module({
  providers: [AmplitudeService, AmplitudeInterceptor],
  exports: [AmplitudeService],
})
export class AmplitudeModule {}
