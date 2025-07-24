import { Throttle, SkipThrottle } from './throttle.decorator';
import {
  Throttle as NestThrottle,
  SkipThrottle as NestSkipThrottle,
} from '@nestjs/throttler';

jest.mock('@nestjs/throttler', () => ({
  Throttle: jest.fn().mockImplementation((options: unknown) => {
    return (
      target: unknown,
      propertyKey?: string,
      descriptor?: PropertyDescriptor,
    ) => {
      if (propertyKey && descriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        descriptor.value._throttleOptions = options;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (target as any)._throttleOptions = options;
      }
      return descriptor || target;
    };
  }),
  SkipThrottle: jest
    .fn()
    .mockImplementation((skipOptions?: Record<string, boolean>) => {
      return (
        target: unknown,
        propertyKey?: string,
        descriptor?: PropertyDescriptor,
      ) => {
        if (propertyKey && descriptor) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          descriptor.value._skipThrottle = skipOptions;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (target as any)._skipThrottle = skipOptions;
        }
        return descriptor || target;
      };
    }),
}));

describe('Throttle Decorators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Throttle', () => {
    it('should call NestJS Throttle with correct short limit', () => {
      @Throttle({ short: { ttl: 1, limit: 5 } })
      class TestController {
        testMethod() {}
      }

      // Instantiate to use the decorator
      new TestController();

      expect(NestThrottle).toHaveBeenCalledWith({
        short: { ttl: 1000, limit: 5 },
      });
    });

    it('should call NestJS Throttle with correct long limit', () => {
      @Throttle({ long: { ttl: 60, limit: 100 } })
      class TestController {
        testMethod() {}
      }

      // Instantiate to use the decorator
      new TestController();

      expect(NestThrottle).toHaveBeenCalledWith({
        long: { ttl: 60000, limit: 100 },
      });
    });

    it('should call NestJS Throttle with both limits', () => {
      @Throttle({
        short: { ttl: 1, limit: 5 },
        long: { ttl: 60, limit: 100 },
      })
      class TestController {
        testMethod() {}
      }

      // Instantiate to use the decorator
      new TestController();

      expect(NestThrottle).toHaveBeenCalledWith({
        short: { ttl: 1000, limit: 5 },
        long: { ttl: 60000, limit: 100 },
      });
    });

    it('should apply to class level', () => {
      @Throttle({ short: { ttl: 1, limit: 5 } })
      class TestController {}

      // Instantiate to use the decorator
      new TestController();

      expect(NestThrottle).toHaveBeenCalledWith({
        short: { ttl: 1000, limit: 5 },
      });
    });
  });

  describe('SkipThrottle', () => {
    it('should call NestJS SkipThrottle with default true when no args', () => {
      @SkipThrottle()
      class TestController {
        testMethod() {}
      }

      // Instantiate to use the decorator
      new TestController();

      expect(NestSkipThrottle).toHaveBeenCalledWith({ default: true });
    });

    it('should call NestJS SkipThrottle with custom options when specified', () => {
      @SkipThrottle({ short: true, long: false })
      class TestController {
        testMethod() {}
      }

      // Instantiate to use the decorator
      new TestController();

      expect(NestSkipThrottle).toHaveBeenCalledWith({
        short: true,
        long: false,
      });
    });
  });
});
