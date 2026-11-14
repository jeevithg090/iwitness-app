/**
 * Minimal fixed-window rate limiter kept in process memory.
 *
 * Good enough to blunt casual abuse on a single instance. On serverless or
 * multi-instance deployments each instance keeps its own counters, so put a
 * shared store (e.g. Redis/Upstash) or your platform's WAF in front for real
 * protection.
 */
export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string, now = Date.now()): RateLimitResult {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }
      return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }
    entry.count += 1;
    const ok = entry.count <= limit;
    return {
      ok,
      remaining: Math.max(0, limit - entry.count),
      retryAfterSeconds: ok ? 0 : Math.ceil((entry.resetAt - now) / 1000),
    };
  };
}

/**
 * Best-effort client key. The IP is used only as an in-memory bucket key for
 * rate limiting and is never stored or logged.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
