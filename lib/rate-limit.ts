type Bucket = {
  count: number;
  resetAt: number;
};

const store = globalThis as typeof globalThis & { __memorialRateLimit?: Map<string, Bucket> };

function getStore() {
  if (!store.__memorialRateLimit) {
    store.__memorialRateLimit = new Map();
  }
  return store.__memorialRateLimit;
}

export function applyRateLimit(key: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const buckets = getStore();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }
  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true, remaining: limit - existing.count };
}
