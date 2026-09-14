/**
 * Client-Side Rate Limiter & Debounce Helper
 * Protects Supabase mutations and API endpoints from flood, double-clicks and bursts.
 */

const callTimestamps: Map<string, number[]> = new Map();

export interface RateLimitOptions {
  limit?: number;        // Max requests allowed in the window
  windowMs?: number;     // Window in milliseconds (e.g. 5000ms)
}

/**
 * Returns true if the action is allowed, or false if rate limited.
 */
export function checkRateLimit(key: string, options: RateLimitOptions = {}): boolean {
  const limit = options.limit ?? 5;
  const windowMs = options.windowMs ?? 5000;
  const now = Date.now();

  const timestamps = callTimestamps.get(key) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    return false;
  }

  validTimestamps.push(now);
  callTimestamps.set(key, validTimestamps);
  return true;
}

/**
 * Higher-order function to throttle an async function with safety lockout
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  key: string,
  options?: RateLimitOptions,
  onLimitExceeded?: () => void
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  return async (...args: Parameters<T>) => {
    if (!checkRateLimit(key, options)) {
      if (onLimitExceeded) onLimitExceeded();
      console.warn('[RateLimit] Action "' + key + '" was blocked due to high frequency.');
      return undefined;
    }
    return await fn(...args);
  };
}
