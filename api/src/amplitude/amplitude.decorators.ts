import { AmplitudeService } from './amplitude.service';

export const LogTgEvent = (eventType: string) => {
  const amplitudeService = new AmplitudeService();

  return function decorator(t, n, descriptor) {
    console.log(t);
    console.log(n);
    console.log(descriptor);
    const func = descriptor.value;

    descriptor.value = function (...args) {
      const result = func.apply(this, args);
      try {
        amplitudeService.logEvent({ event_type: eventType }).then(() => console.log(`send event ${eventType}`));
      } finally {
        return result;
      }
    };

    return descriptor;
  };
};
