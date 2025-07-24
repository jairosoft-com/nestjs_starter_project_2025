import {
  Throttle as NestThrottle,
  SkipThrottle as NestSkipThrottle,
} from '@nestjs/throttler';

/**
 * Rate limit configuration for a specific time window.
 */
export interface RateLimitConfig {
  /** Time window in seconds */
  ttl: number;
  /** Maximum number of requests allowed in the time window */
  limit: number;
}

/**
 * Throttle options supporting multiple time windows.
 */
export interface ThrottleOptions {
  /** Short-term rate limit (e.g., burst protection) */
  short?: RateLimitConfig;
  /** Long-term rate limit (e.g., hourly/daily limits) */
  long?: RateLimitConfig;
}

/**
 * Custom throttle decorator for applying rate limits to controllers or routes.
 *
 * Supports multiple time windows for flexible rate limiting strategies.
 * Time values are in seconds and automatically converted to milliseconds.
 *
 * @param {ThrottleOptions} options - Rate limiting configuration
 * @returns {MethodDecorator & ClassDecorator} Decorator function
 * @example
 * // Apply burst protection: 5 requests per second
 * @Throttle({ short: { ttl: 1, limit: 5 } })
 *
 * // Apply hourly limit: 100 requests per hour
 * @Throttle({ long: { ttl: 3600, limit: 100 } })
 *
 * // Apply both limits
 * @Throttle({
 *   short: { ttl: 1, limit: 5 },
 *   long: { ttl: 3600, limit: 100 }
 * })
 */
export function Throttle(
  options: ThrottleOptions,
): MethodDecorator & ClassDecorator {
  interface ThrottlerConfig {
    short?: { ttl: number; limit: number };
    long?: { ttl: number; limit: number };
  }

  const throttlerOptions: ThrottlerConfig = {};

  if (options.short) {
    throttlerOptions.short = {
      ttl: options.short.ttl * 1000, // Convert to milliseconds
      limit: options.short.limit,
    };
  }

  if (options.long) {
    throttlerOptions.long = {
      ttl: options.long.ttl * 1000, // Convert to milliseconds
      limit: options.long.limit,
    };
  }

  return NestThrottle(
    throttlerOptions as Record<string, { ttl: number; limit: number }>,
  );
}

/**
 * Skip throttling for specific routes or controllers.
 *
 * Useful for excluding certain endpoints from rate limiting,
 * such as health checks or public resources.
 *
 * @param {Record<string, boolean>} [skipOptions] - Throttler names to skip
 * @returns {MethodDecorator & ClassDecorator} Decorator function
 * @example
 * // Skip all throttling for health check endpoint
 * @SkipThrottle()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export function SkipThrottle(
  skipOptions?: Record<string, boolean>,
): MethodDecorator & ClassDecorator {
  // If no options provided, skip all throttlers
  if (!skipOptions) {
    return NestSkipThrottle({ default: true });
  }
  return NestSkipThrottle(skipOptions);
}
