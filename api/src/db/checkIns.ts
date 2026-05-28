import { randomUUID } from 'node:crypto';
import type { CheckIn, Feeling } from '@afford/shared';
import { hashDel, hashGetAll, hashSet } from '../lib/hashStore.js';

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

// Caller passes the set of wishIds owned by the user being wiped; we drop
// matching check-ins. Doing it this way avoids adding userId to CheckIn,
// which would require a migration of existing Redis data.
export async function wipeCheckInsByWishIds(wishIds: Iterable<string>): Promise<void> {
  const set = new Set(wishIds);
  const remove: string[] = [];
  for (let i = checkIns.length - 1; i >= 0; i--) {
    if (set.has(checkIns[i]!.wishId)) {
      remove.push(checkIns[i]!.id);
      checkIns.splice(i, 1);
    }
  }
  for (const id of remove) hashDel(REDIS_KEY, id);
}
