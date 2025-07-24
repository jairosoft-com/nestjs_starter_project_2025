import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Gets the throttler configuration for rate limiting.
 *
 * Configures global rate limiting to prevent abuse and ensure fair usage.
 * Default: 10 requests per minute per IP address.
 *
 * @returns {ThrottlerModuleOptions} Throttler module configuration
 * @example
 * const config = getThrottlerConfig();
 * // Returns: { throttlers: [{ ttl: 60000, limit: 10 }] }
 */
export function getThrottlerConfig(): ThrottlerModuleOptions {
  const ttlSeconds = parseInt(process.env.THROTTLE_TTL || '60', 10);
  const limit = parseInt(process.env.THROTTLE_LIMIT || '10', 10);

  return {
    throttlers: [
      {
        ttl: isNaN(ttlSeconds) ? 60000 : ttlSeconds * 1000, // Convert to milliseconds
        limit: isNaN(limit) ? 10 : limit,
      },
    ],
  };
}
