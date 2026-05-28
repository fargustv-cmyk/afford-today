// Thin Upstash Redis Hash adapter. Each in-memory Map<id, T> in /db gets a
// matching Redis HASH; we write through on mutation and load on boot so user
// data (wishes, steps, events, check-ins) survives Render's cold restarts
// until we ship the Postgres migration.
//
// All writes are fire-and-forget against Redis. The in-memory copy is updated
// synchronously, so subsequent reads see the new value immediately. If the
// Redis write fails we log and move on — the data is still persisted in the
// in-memory map until the next mutation reaches Redis successfully.

import { env } from '../env.js';

const redisEnabled = !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
const URL = env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '');
const TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

async function exec(command: unknown[]): Promise<unknown> {
  if (!redisEnabled) return null;
  try {
    const r = await fetch(URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });
    if (!r.ok) {
      console.warn(`[redis] ${command[0]} ${r.status}:`, await r.text().catch(() => ''));
      return null;
    }
    const j = (await r.json()) as { result?: unknown };
    return j.result ?? null;
  } catch (e) {
    console.warn(`[redis] ${command[0]} failed`, e);
    return null;
  }
}

export function hashSet(key: string, field: string, value: string): void {
  // Intentionally not awaited; caller's mutation already touched in-memory.
  void exec(['HSET', key, field, value]);
}

export function hashDel(key: string, field: string): void {
  void exec(['HDEL', key, field]);
}

export async function hashGetAll<T>(key: string): Promise<Record<string, T>> {
  const raw = (await exec(['HGETALL', key])) as Record<string, string> | string[] | null;
  if (!raw) return {};
  // Upstash returns an object map {field: value}; defensive against either shape.
  const out: Record<string, T> = {};
  if (Array.isArray(raw)) {
    for (let i = 0; i + 1 < raw.length; i += 2) {
      try { out[raw[i]!] = JSON.parse(raw[i + 1]!) as T; } catch { /* skip corrupt */ }
    }
  } else {
    for (const [k, v] of Object.entries(raw)) {
      try { out[k] = JSON.parse(v) as T; } catch { /* skip corrupt */ }
    }
  }
  return out;
}

export const redisAvailable = redisEnabled;
