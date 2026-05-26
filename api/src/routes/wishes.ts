import type { FastifyInstance } from 'fastify';
import type { CreateWishInput, OgPreview, Wish, WishType, LifeDomain } from '@afford/shared';
import { requireUser } from '../lib/requireUser.js';
import { listActiveWishes, createWish } from '../db/wishes.js';
import { fetchOgPreview } from '../lib/ogParse.js';

const VALID_TYPES: WishType[] = ['essential', 'need', 'want'];
const VALID_DOMAINS: LifeDomain[] = ['clothes', 'leisure', 'comfort', 'health', 'joy', 'food', 'other'];

interface OgQuery {
  url: string;
}

export async function wishesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req, reply) => {
    if (req.url.startsWith('/api/wishes') || req.url.startsWith('/api/og')) {
      await requireUser(req, reply);
    }
  });

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
      const wish = await createWish(userId, {
        title: body.title,
        price,
        sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : null,
        imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : null,
        type: body.type,
        domain: body.domain,
        currency: body.currency || 'RUB'
      });
      return { wish };
    }
  );

  // OG preview — auth-gated so randos can't pivot through it as an open proxy.
  app.get<{ Querystring: OgQuery; Reply: OgPreview | { error: string } }>(
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
