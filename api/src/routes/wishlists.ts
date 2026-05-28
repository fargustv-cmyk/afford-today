import type { FastifyInstance } from 'fastify';
import type { Wishlist } from '@afford/shared';
import {
  listWishlists,
  getDefaultWishlist,
  createWishlist,
  renameWishlist,
  deleteWishlist
} from '../db/wishlists.js';
import { reassignWishesFromDeletedList } from '../db/wishes.js';
import { isPro } from '../lib/proStatus.js';

export async function wishlistsRoutes(app: FastifyInstance) {
  // List always includes the default wishlist; auto-creates one for first-time users.
  app.get<{ Reply: { wishlists: Wishlist[] } }>('/api/wishlists', async (req) => {
    const userId = req.tgUser!.id;
    let lists = await listWishlists(userId);
    if (lists.length === 0) {
      await getDefaultWishlist(userId);
      lists = await listWishlists(userId);
    }
    return { wishlists: lists };
  });

  // Create new wishlist — Pro only.
  app.post<{ Body: { title: string }; Reply: { wishlist: Wishlist } | { error: string } }>(
    '/api/wishlists',
    async (req, reply) => {
      const userId = req.tgUser!.id;
      if (!isPro(userId)) {
        reply.code(402);
        return { error: 'pro required' };
      }
      const title = req.body?.title;
      if (!title || typeof title !== 'string' || !title.trim()) {
        reply.code(400);
        return { error: 'title required' };
      }
      const w = await createWishlist(userId, title);
      return { wishlist: w };
    }
  );

  // Rename — Pro only; the default list is server-protected.
  app.patch<{
    Params: { id: string };
    Body: { title: string };
    Reply: { wishlist: Wishlist } | { error: string };
  }>('/api/wishlists/:id', async (req, reply) => {
    const userId = req.tgUser!.id;
    if (!isPro(userId)) {
      reply.code(402);
      return { error: 'pro required' };
    }
    const title = req.body?.title;
    if (!title || typeof title !== 'string' || !title.trim()) {
      reply.code(400);
      return { error: 'title required' };
    }
    const w = await renameWishlist(userId, req.params.id, title);
    if (!w) {
      reply.code(404);
      return { error: 'wishlist not found or not editable' };
    }
    return { wishlist: w };
  });

  // Delete — Pro only; wishes migrate back to the default list.
  app.delete<{
    Params: { id: string };
    Reply: { ok: true } | { error: string };
  }>('/api/wishlists/:id', async (req, reply) => {
    const userId = req.tgUser!.id;
    if (!isPro(userId)) {
      reply.code(402);
      return { error: 'pro required' };
    }
    const ok = await deleteWishlist(userId, req.params.id);
    if (!ok) {
      reply.code(404);
      return { error: 'wishlist not found or not deletable' };
    }
    // Move any orphaned wishes back to default so they don't disappear.
    const def = await getDefaultWishlist(userId);
    await reassignWishesFromDeletedList(userId, req.params.id, def.id);
    return { ok: true };
  });
}
