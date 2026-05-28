// Persists user.settings (theme, interpretation, notifications) in Upstash
// Redis so Pro-purchased themes survive Render free-tier cold starts.
//
// Key shape: `afford:user:<userId>:settings` → JSON.stringify(UserSettings).
// In-memory cache mirrors Redis; updates go through writeSettings(), which
// is fire-and-forget for Redis to keep the request path snappy.

import type { UserSettings } from '@afford/shared';
import { env } from '../env.js';

const cache = new Map<number, UserSettings>();
const redisEnabled = !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

const keyFor = (userId: number) => `afford:user:${userId}:settings`;

async function redisGet(key: string): Promise<string | null> {
  if (!redisEnabled) return null;
  const url = env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '') + '/get/' + encodeURIComponent(key);
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` }
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { result?: string | null };
    return j.result ?? null;
  } catch (e) {
    console.warn('[settings] redis get failed', e);
    return null;
  }
}

async function redisSet(key: string, value: string): Promise<void> {
  if (!redisEnabled) return;
  const url =
    env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '') +
    '/set/' +
    encodeURIComponent(key) +
    '/' +
    encodeURIComponent(value);
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` }
    });
    if (!r.ok) console.warn('[settings] redis set status', r.status);
  } catch (e) {
    console.warn('[settings] redis set failed', e);
  }
}

export async function readSettings(userId: number): Promise<UserSettings> {
  if (cache.has(userId)) return cache.get(userId)!;
  const raw = await redisGet(keyFor(userId));
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as UserSettings;
      cache.set(userId, parsed);
      return parsed;
    } catch {
      // corrupted JSON — overwrite on next write
    }
  }
  const empty: UserSettings = {};
  cache.set(userId, empty);
  return empty;
}

export async function writeSettings(userId: number, settings: UserSettings): Promise<void> {
  cache.set(userId, settings);
  // Fire-and-forget; in-memory cache makes the next read instant either way.
  void redisSet(keyFor(userId), JSON.stringify(settings));
}

export async function wipeSettings(userId: number): Promise<void> {
  cache.delete(userId);
  if (redisEnabled) {
    const url = env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '') + '/del/' + encodeURIComponent(keyFor(userId));
    try {
      await fetch(url, { headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` } });
    } catch (e) {
      console.warn('[settings] redis del failed', e);
    }
  }
}
