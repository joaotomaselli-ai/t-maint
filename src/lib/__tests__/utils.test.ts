import { describe, it, expect } from 'vitest';
import { cn } from '../utils';
import { checkRateLimit } from '../rate-limit';

describe('Utility Functions', () => {
  it('cn() correctly merges tailwind classes without conflict', () => {
    const result = cn('px-4 py-2', 'bg-blue-500', 'px-6');
    expect(result).toContain('px-6');
    expect(result).not.toContain('px-4');
    expect(result).toContain('bg-blue-500');
  });

  it('cn() handles conditional classes cleanly', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn('base', isActive && 'active', isDisabled && 'disabled');
    expect(result).toBe('base active');
  });
});

describe('Rate Limiter Module', () => {
  it('allows calls within rate limit threshold', () => {
    const key = 'test-action-1';
    expect(checkRateLimit(key, { limit: 3, windowMs: 1000 })).toBe(true);
    expect(checkRateLimit(key, { limit: 3, windowMs: 1000 })).toBe(true);
    expect(checkRateLimit(key, { limit: 3, windowMs: 1000 })).toBe(true);
  });

  it('blocks excessive calls that exceed limit threshold', () => {
    const key = 'test-action-blocked';
    checkRateLimit(key, { limit: 2, windowMs: 2000 });
    checkRateLimit(key, { limit: 2, windowMs: 2000 });
    // 3rd call should be blocked
    expect(checkRateLimit(key, { limit: 2, windowMs: 2000 })).toBe(false);
  });
});
