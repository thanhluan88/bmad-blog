/**
 * In-memory rate limit store for login attempts.
 * MVP: simple in-memory store. Pluggable (e.g. Redis) later.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

type Entry = { count: number; windowStart: number };

const store = new Map<string, Entry>();

function pruneOldEntries(entries: Map<string, Entry>) {
  const now = Date.now();
  for (const [key, entry] of entries) {
    if (now - entry.windowStart >= WINDOW_MS) {
      entries.delete(key);
    }
  }
}

/**
 * Check if the key is allowed (not rate limited).
 * @returns { allowed, retryAfter? } — retryAfter if blocked, seconds until window resets
 */
export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  pruneOldEntries(store);
  const entry = store.get(key);
  if (!entry) return { allowed: true };
  const isExpired = Date.now() - entry.windowStart >= WINDOW_MS;
  if (isExpired) {
    store.delete(key);
    return { allowed: true };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (Date.now() - entry.windowStart)) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true };
}

/**
 * Record a failed attempt for the key.
 */
export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, windowStart: now });
    return;
  }
  const isExpired = now - entry.windowStart >= WINDOW_MS;
  if (isExpired) {
    store.set(key, { count: 1, windowStart: now });
    return;
  }
  entry.count += 1;
}

/**
 * Clear failed attempts for the key (e.g. on successful login).
 */
export function clearFailedAttempts(key: string): void {
  store.delete(key);
}
