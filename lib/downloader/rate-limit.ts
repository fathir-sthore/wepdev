import "server-only";

/**
 * Best-effort in-memory rate limit. Serverless functions don't share memory
 * across instances, so this only throttles bursts on a warm instance — it's
 * not a hard guarantee. Good enough to stop a single client hammering the
 * free third-party APIs we depend on.
 */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return timestamps.length > MAX_PER_WINDOW;
}
