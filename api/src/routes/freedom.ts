import type { FastifyInstance } from 'fastify';
import type { EnrichedEvent, UserFreedom } from '@afford/shared';
import { getUserFreedom, listEvents } from '../db/permissionEvents.js';
import { getWishById } from '../db/wishes.js';

export async function freedomRoutes(app: FastifyInstance) {
  app.get<{ Reply: UserFreedom }>('/api/freedom', async (req) => {
    const userId = req.tgUser!.id;
    const base = await getUserFreedom(userId);

    const raw = await listEvents(userId);
    const enriched: EnrichedEvent[] = [];
    for (const e of raw) {
      const wish = e.wishId ? await getWishById(e.wishId) : null;
      enriched.push({
        id: e.id,
        wishId: e.wishId,
        wishTitle: wish?.title ?? null,
        wishPrice: wish?.price ?? null,
        wishCurrency: wish?.currency ?? null,
        value: e.value,
        domain: e.domain,
        belowThreshold: e.belowThreshold,
        createdAt: e.createdAt
      });
    }
    // newest first
    enriched.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return { ...base, events: enriched };
  });
}
