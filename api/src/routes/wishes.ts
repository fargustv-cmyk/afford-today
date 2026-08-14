import type { FastifyInstance } from 'fastify';
import type {
  CheckIn,
  CreateWishInput,
  Feeling,
  InterpretationMode,
  LifeDomain,
  OgPreview,
  Wish,
  WishType
} from '@afford/shared';
import {
  allowWish,
  createWish,
  getWishById,
  listActiveWishes,
  markWishPurchased,
  postponeWish
} from '../db/wishes.js';
import { fetchOgPreview } from '../lib/ogParse.js';
import { createCheckIn } from '../db/checkIns.js';
import { getDefaultWishlist, getWishlistById } from '../db/wishlists.js';
import { isPro } from '../lib/proStatus.js';
import { trackProductEvent } from '../lib/analytics.js';

const VALID_TYPES: WishType[] = ['essential', 'need', 'want'];
const VALID_DOMAINS: LifeDomain[] = ['clothes', 'leisure', 'comfort', 'health', 'joy', 'food', 'other'];
const VALID_FEELINGS: Feeling[] = ['zero_guilt', 'joy', 'scared_but_good', 'empty', 'guilt'];
const VALID_INTERPRETATIONS: InterpretationMode[] = ['permission', 'effort', 'both'];

interface OgQuery {
  url: string;
}

export async function wishesRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { wishlist?: string }; Reply: { wishes: Wish[] } }>(
    '/api/wishes',
    async (req) => {
      const userId = req.tgUser!.id;
      const filter = req.query?.wishlist ?? null;
      const wishes = await listActiveWishes(userId, filter);
      // Legacy wishes with wishlistId=null show up in the default list so they
      // don't go missing when the user starts using collections.
      if (filter) {
        const def = await getDefaultWishlist(userId);
        if (filter === def.id) {
          const legacy = (await listActiveWishes(userId)).filter((w) => !w.wishlistId);
          for (const w of legacy) wishes.push(w);
          wishes.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        }
      }
      return { wishes };
    }
  );

  app.post<{ Body: CreateWishInput; Reply: { wish: Wish } | { error: string } }>(
    '/api/wishes',
    async (req, reply) => {
      const userId = req.tgUser!.id;
      const body = req.body;
      if (!body?.title || typeof body.title !== 'string') {
        reply.code(400);
        return { error: 'title required' };
      }
      if (!VALID_TYPES.includes(body.type)) {
        reply.code(400);
        return { error: 'invalid type' };
      }
      if (!VALID_DOMAINS.includes(body.domain)) {
        reply.code(400);
        return { error: 'invalid domain' };
      }
      const price = typeof body.price === 'number' && body.price > 0 ? body.price : null;
      const interpretation: InterpretationMode =
        body.interpretation && VALID_INTERPRETATIONS.includes(body.interpretation)
          ? body.interpretation
          : 'both';
      // Validate wishlist ownership; Pro-gate non-default lists server-side.
      let wishlistId: string | null = null;
      if (body.wishlistId) {
        const list = await getWishlistById(body.wishlistId);
        if (!list || list.userId !== userId) {
          reply.code(404);
          return { error: 'wishlist not found' };
        }
        if (!list.isDefault && !isPro(userId)) {
          reply.code(402);
          return { error: 'pro required for non-default wishlists' };
        }
        wishlistId = list.id;
      }
      const wish = await createWish(userId, {
        title: body.title,
        price,
        sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : null,
        imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : null,
        type: body.type,
        domain: body.domain,
        interpretation,
        currency: body.currency || 'RUB',
        wishlistId
      });
      trackProductEvent('wish_created');
      return { wish };
    }
  );

  // "Уже купил(а)" — NEVER blocks. Writes a permission_event.
  app.post<{
    Params: { id: string };
    Reply: { wish: Wish; belowThreshold: boolean; justPurchased: boolean } | { error: string };
  }>('/api/wishes/:id/mark-bought', async (req, reply) => {
    const userId = req.tgUser!.id;
    const result = await markWishPurchased(userId, req.params.id);
    if (!result.wish) {
      reply.code(404);
      return { error: 'wish not found' };
    }
    if (result.justPurchased) trackProductEvent('wish_purchased');
    return { wish: result.wish, belowThreshold: result.belowThreshold, justPurchased: result.justPurchased };
  });

  // A conscious "yes" after the short decision ritual. This never checks
  // points: permission belongs to the user, not to the app.
  app.post<{
    Params: { id: string };
    Reply: { wish: Wish; justAllowed: boolean } | { error: string };
  }>('/api/wishes/:id/allow', async (req, reply) => {
    const userId = req.tgUser!.id;
    const result = await allowWish(userId, req.params.id);
    if (!result.wish) {
      reply.code(404);
      return { error: 'wish not found' };
    }
    if (result.justAllowed) trackProductEvent('wish_allowed');
    return { wish: result.wish, justAllowed: result.justAllowed };
  });

  app.post<{
    Params: { id: string };
    Reply: { wish: Wish; justPostponed: boolean } | { error: string };
  }>('/api/wishes/:id/postpone', async (req, reply) => {
    const result = await postponeWish(req.tgUser!.id, req.params.id);
    if (!result.wish) {
      reply.code(404);
      return { error: 'wish not found' };
    }
    if (result.justPostponed) trackProductEvent('wish_postponed');
    return { wish: result.wish, justPostponed: result.justPostponed };
  });

  // Check-in after purchase (SPEC §7). One reaction tap + optional note.
  // Note is PRIVATE — never shared, never used for marketing.
  app.post<{
    Params: { id: string };
    Body: { feeling?: Feeling; note?: string };
    Reply: { checkIn: CheckIn } | { error: string };
  }>('/api/wishes/:id/check-in', async (req, reply) => {
    const userId = req.tgUser!.id;
    const wish = await getWishById(req.params.id);
    if (!wish || wish.userId !== userId) {
      reply.code(404);
      return { error: 'wish not found' };
    }
    if (!wish.purchasedAt) {
      reply.code(400);
      return { error: 'wish must be purchased first' };
    }
    const { feeling, note } = req.body ?? {};
    if (!feeling || !VALID_FEELINGS.includes(feeling)) {
      reply.code(400);
      return { error: 'invalid feeling' };
    }
    const checkIn = await createCheckIn(wish.id, feeling, note ?? null);
    trackProductEvent('checkin_created');
    return { checkIn };
  });

  // OG preview — auth-gated so randos can't pivot through it as an open proxy.
  // (Server-level preHandler enforces this for everything under /api/og.)
  // Optional one-shot debug bypass: ?test=<OG_TEST_TOKEN>. Used to diagnose
  // anti-bot behaviour from the production IP; safe to leave unset in prod.
  app.get<{ Querystring: OgQuery & { test?: string }; Reply: OgPreview | { error: string } }>(
    '/api/og',
    async (req, reply) => {
      const url = req.query?.url;
      if (!url || typeof url !== 'string') {
        reply.code(400);
        return { error: 'url required' };
      }
      const preview = await fetchOgPreview(url);
      return preview;
    }
  );
}
