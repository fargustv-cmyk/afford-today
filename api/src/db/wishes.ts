// In-memory wish store. Swapped for Postgres + Drizzle when the DB lands.
// Kept narrow so the migration is a single-file change.

import { randomUUID } from 'node:crypto';
import type { CreateWishInput, Wish } from '@afford/shared';
import { pointsRequiredFor } from '@afford/shared';
import { recordWishPermission } from './permissionEvents.js';
import { notifyUnlock } from '../lib/notifications.js';
import { hashDel, hashGetAll, hashSet } from '../lib/hashStore.js';

const REDIS_KEY = 'afford:wishes';
const wishes = new Map<string, Wish>();

function persist(w: Wish) { hashSet(REDIS_KEY, w.id, JSON.stringify(w)); }

export async function loadWishesFromRedis(): Promise<void> {
  const map = await hashGetAll<Wish>(REDIS_KEY);
  for (const w of Object.values(map)) wishes.set(w.id, w);
  console.log(`[wishes] loaded ${wishes.size} wish(es) from redis`);
}

export async function getWishById(id: string): Promise<Wish | null> {
  return wishes.get(id) ?? null;
}

/**
 * Add points to a wish. If we cross the threshold, flip status to 'unlocked'
 * and record a permission_event (value=0, below_threshold=false). Returns the
 * updated wish.
 */
export async function addPointsToWish(wishId: string, points: number): Promise<Wish | null> {
  const w = wishes.get(wishId);
  if (!w) return null;
  if (w.purchasedAt) return w;
  w.pointsEarned = (w.pointsEarned || 0) + points;
  if (w.status === 'active' && w.pointsEarned >= w.pointsRequired) {
    w.status = 'unlocked';
    w.unlockedAt = new Date().toISOString();
    await recordWishPermission(w.userId, w.id, 0, w.domain, false);
    // Fire-and-forget bot congrats; never block the API response on it.
    notifyUnlock(w).catch((err) => console.warn('notifyUnlock failed', err));
  }
  persist(w);
  return w;
}

/**
 * Mark a wish as purchased. NEVER blocked — always succeeds for an own wish
 * regardless of points (SPEC §1.1 / CLAUDE.md rule #1). Writes a
 * permission_event with value=price, below_threshold=true iff
 * points_earned < points_required at this moment.
 *
 * Idempotent: re-calling on an already-purchased wish returns the existing
 * state and writes no extra event.
 */
export async function markWishPurchased(
  userId: number,
  wishId: string
): Promise<{ wish: Wish | null; belowThreshold: boolean; justPurchased: boolean }> {
  const w = wishes.get(wishId);
  if (!w || w.userId !== userId) return { wish: null, belowThreshold: false, justPurchased: false };
  if (w.purchasedAt) return { wish: w, belowThreshold: false, justPurchased: false };

  const belowThreshold = w.pointsEarned < w.pointsRequired;
  w.status = 'purchased';
  w.purchasedAt = new Date().toISOString();
  // If unlocked event hasn't been written yet (purchased without filling the
  // bar), this is the only event we ever write for this wish.
  await recordWishPermission(w.userId, w.id, w.price ?? 0, w.domain, belowThreshold);
  persist(w);
  return { wish: w, belowThreshold, justPurchased: true };
}

/**
 * The v0.3 core action: the user decides for themselves that the purchase is
 * allowed. No points or chores are required. Existing wishes remain fully
 * compatible because we reuse the established `unlocked` status.
 */
export async function allowWish(
  userId: number,
  wishId: string
): Promise<{ wish: Wish | null; justAllowed: boolean }> {
  const w = wishes.get(wishId);
  if (!w || w.userId !== userId) return { wish: null, justAllowed: false };
  if (w.status === 'purchased' || w.status === 'unlocked') {
    return { wish: w, justAllowed: false };
  }
  w.status = 'unlocked';
  w.unlockedAt = new Date().toISOString();
  await recordWishPermission(w.userId, w.id, 0, w.domain, true);
  persist(w);
  return { wish: w, justAllowed: true };
}

/** Persist the equally valid "not now" outcome without removing the wish. */
export async function postponeWish(
  userId: number,
  wishId: string
): Promise<{ wish: Wish | null; justPostponed: boolean }> {
  const w = wishes.get(wishId);
  if (!w || w.userId !== userId) return { wish: null, justPostponed: false };
  if (w.status !== 'active') return { wish: w, justPostponed: false };
  const justPostponed = !w.postponedAt;
  w.postponedAt = new Date().toISOString();
  persist(w);
  return { wish: w, justPostponed };
}

export function getWishStateCounts(): {
  total: number;
  undecided: number;
  postponed: number;
  allowed: number;
  purchased: number;
} {
  const counts = { total: 0, undecided: 0, postponed: 0, allowed: 0, purchased: 0 };
  for (const wish of wishes.values()) {
    if (wish.status === 'archived') continue;
    counts.total += 1;
    if (wish.status === 'purchased') counts.purchased += 1;
    else if (wish.status === 'unlocked') counts.allowed += 1;
    else if (wish.postponedAt) counts.postponed += 1;
    else counts.undecided += 1;
  }
  return counts;
}

export async function listActiveWishes(userId: number, wishlistId?: string | null): Promise<Wish[]> {
  const out: Wish[] = [];
  for (const w of wishes.values()) {
    if (w.userId !== userId) continue;
    if (w.status !== 'active' && w.status !== 'unlocked') continue;
    if (wishlistId !== undefined && wishlistId !== null) {
      if ((w.wishlistId ?? null) !== wishlistId) continue;
    }
    out.push(w);
  }
  // Newest first
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
}

export async function wipeWishesForUser(userId: number): Promise<string[]> {
  const ids: string[] = [];
  for (const [id, w] of wishes.entries()) {
    if (w.userId === userId) ids.push(id);
  }
  for (const id of ids) {
    wishes.delete(id);
    hashDel('afford:wishes', id);
  }
  return ids;
}

// When a Pro user deletes a non-default wishlist, sweep its wishes back to
// the default list so they don't vanish from the user's view.
export async function reassignWishesFromDeletedList(
  userId: number,
  fromListId: string,
  toListId: string
): Promise<void> {
  for (const w of wishes.values()) {
    if (w.userId === userId && w.wishlistId === fromListId) {
      w.wishlistId = toListId;
      hashSet('afford:wishes', w.id, JSON.stringify(w));
    }
  }
}

export async function createWish(userId: number, input: CreateWishInput): Promise<Wish> {
  const now = new Date().toISOString();
  // SERVER-AUTHORITATIVE threshold (SPEC §4) — never trust the client.
  const pointsRequired = pointsRequiredFor(input.type, input.price ?? null);
  // essential ⇒ already unlocked
  const status: Wish['status'] = pointsRequired === 0 ? 'unlocked' : 'active';

  const wish: Wish = {
    id: randomUUID(),
    userId,
    title: input.title.trim(),
    imageUrl: input.imageUrl ?? null,
    sourceUrl: input.sourceUrl ?? null,
    price: input.price ?? null,
    currency: input.currency ?? 'RUB',
    type: input.type,
    domain: input.domain,
    interpretation: input.interpretation ?? 'both',
    pointsRequired,
    pointsEarned: 0,
    status,
    wishlistId: input.wishlistId ?? null,
    createdAt: now,
    postponedAt: null,
    unlockedAt: status === 'unlocked' ? now : null,
    purchasedAt: null
  };
  wishes.set(wish.id, wish);
  persist(wish);
  return wish;
}
