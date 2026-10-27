import type { CloudflareStore } from './store.js';

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;

export async function checkRateLimit(
  store: CloudflareStore,
  ip: string,
  action: string
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rl:${action}:${ip}`;
  const count = await store.getRateCount(key);
  if (count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: MAX_ATTEMPTS - count };
}

export async function incrementRateLimit(
  store: CloudflareStore,
  ip: string,
  action: string
): Promise<number> {
  const key = `rl:${action}:${ip}`;
  return store.incrRate(key, WINDOW_SECONDS);
}
