// Simple in-memory rate limiter. Replace with Upstash Redis for multi-instance prod.
// Keyed by IP or userId. Sliding window.

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export type RateLimitConfig = {
  /** key prefix, e.g. 'bio-code' */
  prefix: string;
  /** max calls in window */
  max: number;
  /** window length in ms */
  windowMs: number;
};

export const RATE_LIMITS = {
  bioCodeCheck: { prefix: 'bio', max: 3, windowMs: 60 * 60 * 1000 },          // 3/h/user
  walletVerify: { prefix: 'wallet', max: 5, windowMs: 60 * 60 * 1000 },       // 5/h/user
  profileView: { prefix: 'view', max: 60, windowMs: 60 * 1000 },              // 60/min/ip
  reportSubmit: { prefix: 'report', max: 3, windowMs: 24 * 60 * 60 * 1000 },  // 3/day/ip
  exportRequest: { prefix: 'export', max: 10, windowMs: 24 * 60 * 60 * 1000 }, // 10/day/user
  kleinanzeigenScrape: { prefix: 'klein', max: 1, windowMs: 60 * 1000 },      // 1/min/ip
} as const satisfies Record<string, RateLimitConfig>;

export function rateLimit(
  identifier: string,
  cfg: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${cfg.prefix}:${identifier}`;
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + cfg.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: cfg.max - 1, resetAt };
  }

  if (bucket.count >= cfg.max) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: cfg.max - bucket.count, resetAt: bucket.resetAt };
}
