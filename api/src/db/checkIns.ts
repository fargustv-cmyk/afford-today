import { randomUUID } from 'node:crypto';
import type { CheckIn, Feeling } from '@afford/shared';
import { hashGetAll, hashSet } from '../lib/hashStore.js';

// In-memory store. `note` lives here ONLY — never shared, never used for
// marketing, never returned to anyone but the owner (and even then only for
// patterns, which is post-MVP). CLAUDE.md rule #6.
const REDIS_KEY = 'afford:checkIns';
const checkIns: CheckIn[] = [];

export async function loadCheckInsFromRedis(): Promise<void> {
  const map = await hashGetAll<CheckIn>(REDIS_KEY);
  for (const ci of Object.values(map)) checkIns.push(ci);
  console.log(`[checkIns] loaded ${checkIns.length} check-in(s) from redis`);
}

export async function createCheckIn(
  wishId: string,
  feeling: Feeling,
  note: string | null
): Promise<CheckIn> {
  const trimmed = note?.trim() || null;
  const ci: CheckIn = {
    id: randomUUID(),
    wishId,
    feeling,
    note: trimmed,
    createdAt: new Date().toISOString()
  };
  checkIns.push(ci);
  hashSet(REDIS_KEY, ci.id, JSON.stringify(ci));
  return ci;
}
