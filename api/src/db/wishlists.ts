// Wishlists — Pro-only «collections». Every user has exactly one default
// wishlist (auto-created on first access, can't be deleted or renamed). Pro
// users can mint additional wishlists for life-area separation: «на отпуск»,
// «дом», «себе вкусненького» и т.п.
//
// Persistence mirrors the rest of the in-memory stores: Map<id, Wishlist>
// write-through to Redis HASH afford:wishlists, loaded on boot.

import { randomUUID } from 'node:crypto';
import type { Wishlist } from '@afford/shared';
import { hashDel, hashGetAll, hashSet } from '../lib/hashStore.js';

const REDIS_KEY = 'afford:wishlists';
const wishlists = new Map<string, Wishlist>();

function persist(w: Wishlist) { hashSet(REDIS_KEY, w.id, JSON.stringify(w)); }

export async function loadWishlistsFromRedis(): Promise<void> {
  const map = await hashGetAll<Wishlist>(REDIS_KEY);
  for (const w of Object.values(map)) wishlists.set(w.id, w);
  console.log(`[wishlists] loaded ${wishlists.size} wishlist(s) from redis`);
}

export async function listWishlists(userId: number): Promise<Wishlist[]> {
  const out: Wishlist[] = [];
  for (const w of wishlists.values()) if (w.userId === userId) out.push(w);
  // Default first, then by creation time.
  out.sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
  return out;
}

export async function getDefaultWishlist(userId: number): Promise<Wishlist> {
  for (const w of wishlists.values()) if (w.userId === userId && w.isDefault) return w;
  const fresh: Wishlist = {
    id: randomUUID(),
    userId,
    title: 'мой список',
    isDefault: true,
    createdAt: new Date().toISOString()
  };
  wishlists.set(fresh.id, fresh);
  persist(fresh);
  return fresh;
}

export async function createWishlist(userId: number, title: string): Promise<Wishlist> {
  const fresh: Wishlist = {
    id: randomUUID(),
    userId,
    title: title.trim() || 'новый список',
    isDefault: false,
    createdAt: new Date().toISOString()
  };
  wishlists.set(fresh.id, fresh);
  persist(fresh);
  return fresh;
}

export async function renameWishlist(
  userId: number,
  id: string,
  title: string
): Promise<Wishlist | null> {
  const w = wishlists.get(id);
  if (!w || w.userId !== userId || w.isDefault) return null;
  w.title = title.trim() || w.title;
  persist(w);
  return w;
}

export async function deleteWishlist(userId: number, id: string): Promise<boolean> {
  const w = wishlists.get(id);
  if (!w || w.userId !== userId || w.isDefault) return false;
  wishlists.delete(id);
  hashDel(REDIS_KEY, id);
  return true;
}

export async function getWishlistById(id: string): Promise<Wishlist | null> {
  return wishlists.get(id) ?? null;
}

export async function wipeWishlistsForUser(userId: number): Promise<void> {
  const ids: string[] = [];
  for (const [id, w] of wishlists.entries()) {
    if (w.userId === userId) ids.push(id);
  }
  for (const id of ids) {
    wishlists.delete(id);
    hashDel(REDIS_KEY, id);
  }
}
