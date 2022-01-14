import { AmplitudeService } from './amplitude.service';

export const LogTgEvent = () => {
  const amplitudeService = new AmplitudeService();

  return function decorator(t, n, descriptor) {
    const func = descriptor.value;

    descriptor.value = function (...args) {
      const result = func.apply(this, args);
      try {
        const { from, data } = args[0]?.update?.callback_query;
        amplitudeService.logEvent({ event_type: data, user_id: String(from?.id), user_properties: from });
      } finally {
        return result;
      }
    };

    return descriptor;
  };
};
