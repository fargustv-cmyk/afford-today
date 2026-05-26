// In-memory wish store. Swapped for Postgres + Drizzle when the DB lands.
// Kept narrow so the migration is a single-file change.

import { randomUUID } from 'node:crypto';
import type { CreateWishInput, Wish } from '@afford/shared';
import { pointsRequiredFor } from '@afford/shared';

const wishes = new Map<string, Wish>();

export async function listActiveWishes(userId: number): Promise<Wish[]> {
  const out: Wish[] = [];
  for (const w of wishes.values()) {
    if (w.userId === userId && (w.status === 'active' || w.status === 'unlocked')) {
      out.push(w);
    }
  }
  // Newest first
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
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
    pointsRequired,
    pointsEarned: 0,
    status,
    createdAt: now,
    unlockedAt: status === 'unlocked' ? now : null,
    purchasedAt: null
  };
  wishes.set(wish.id, wish);
  return wish;
}
