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
import { listActiveWishes, createWish, markWishPurchased, getWishById } from '../db/wishes.js';
import { fetchOgPreview } from '../lib/ogParse.js';
import { createCheckIn } from '../db/checkIns.js';

const VALID_TYPES: WishType[] = ['essential', 'need', 'want'];
const VALID_DOMAINS: LifeDomain[] = ['clothes', 'leisure', 'comfort', 'health', 'joy', 'food', 'other'];
const VALID_FEELINGS: Feeling[] = ['zero_guilt', 'joy', 'scared_but_good', 'empty', 'guilt'];
const VALID_INTERPRETATIONS: InterpretationMode[] = ['permission', 'effort', 'both'];

interface OgQuery {
  url: string;
}

export async function wishesRoutes(app: FastifyInstance) {
  app.get<{ Reply: { wishes: Wish[] } }>('/api/wishes', async (req) => {
    const userId = req.tgUser!.id;
    const wishes = await listActiveWishes(userId);
    return { wishes };
  });

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
      const wish = await createWish(userId, {
        title: body.title,
        price,
        sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : null,
        imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : null,
        type: body.type,
        domain: body.domain,
        interpretation,
        currency: body.currency || 'RUB'
      });
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
    return { wish: result.wish, belowThreshold: result.belowThreshold, justPurchased: result.justPurchased };
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
