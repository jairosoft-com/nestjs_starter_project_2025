import { getThrottlerConfig } from './throttler.config';

describe('ThrottlerConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getThrottlerConfig', () => {
    it('should return default configuration when no env vars are set', () => {
      const config = getThrottlerConfig();

      expect(config).toEqual({
        throttlers: [
          {
            ttl: 60000, // 1 minute in milliseconds
            limit: 10,
          },
        ],
      });
    });

    it('should use environment variables when set', () => {
      process.env.THROTTLE_TTL = '120';
      process.env.THROTTLE_LIMIT = '20';

      const config = getThrottlerConfig();

      expect(config).toEqual({
        throttlers: [
          {
            ttl: 120000, // 2 minutes in milliseconds
            limit: 20,
          },
        ],
      });
    });

    it('should handle invalid environment variables gracefully', () => {
      process.env.THROTTLE_TTL = 'invalid';
      process.env.THROTTLE_LIMIT = 'invalid';

      const config = getThrottlerConfig();

      expect(config).toEqual({
        throttlers: [
          {
            ttl: 60000,
            limit: 10,
          },
        ],
      });
    });
  });
});
