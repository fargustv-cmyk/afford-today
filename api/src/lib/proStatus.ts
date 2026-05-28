// Pro status: in-memory cache backed by Upstash Redis set `afford:pro` plus
// PRO_USER_IDS env (hand-grants). Mirrors the converter++ pattern — proven on
// a sibling project. Idempotent writes; safe to call repeatedly on payment.

import { env } from '../env.js';

const PRO_KEY = 'afford:pro';
const handGrants = new Set<number>(
  env.PRO_USER_IDS
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
);
const paid = new Set<number>();

const redisEnabled = !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

async function redisFetch(pathParts: string[]): Promise<unknown> {
  if (!redisEnabled) return null;
  const url = env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '') + '/' + pathParts.map(encodeURIComponent).join('/');
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  if (!r.ok) {
    console.warn('[pro] upstash error', r.status, await r.text().catch(() => ''));
    return null;
  }
  return (await r.json()) as unknown;
}

export async function loadPaidUsers(): Promise<void> {
  if (!redisEnabled) {
    console.warn('[pro] UPSTASH_REDIS_* not set — Pro state is in-memory only');
    return;
  }
  const j = (await redisFetch(['smembers', PRO_KEY])) as { result?: string[] } | null;
  const ids = j?.result ?? [];
  for (const s of ids) {
    const n = Number(s);
    if (Number.isFinite(n)) paid.add(n);
  }
  console.log(`[pro] loaded ${paid.size} paid user(s) from upstash, ${handGrants.size} hand-granted`);
}

export function isPro(userId: number): boolean {
  return handGrants.has(userId) || paid.has(userId);
}

export async function markPaid(userId: number): Promise<void> {
  paid.add(userId);
  if (redisEnabled) {
    await redisFetch(['sadd', PRO_KEY, String(userId)]).catch((e) =>
      console.warn('[pro] persist failed', e)
    );
  }
}
