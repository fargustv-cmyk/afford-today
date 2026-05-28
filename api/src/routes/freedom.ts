import type { FastifyInstance } from 'fastify';
import type { EnrichedEvent, FreedomBucket, FreedomPro, UserFreedom } from '@afford/shared';
import { getUserFreedom, listEvents } from '../db/permissionEvents.js';
import { getWishById } from '../db/wishes.js';
import { listStepsByUser } from '../db/steps.js';
import { isPro } from '../lib/proStatus.js';

function startOfWeek(ts: string): string {
  const d = new Date(ts);
  const day = (d.getUTCDay() + 6) % 7; // 0 = Monday
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
function startOfMonth(ts: string): string {
  const d = new Date(ts);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

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

  // Pro: weekly + monthly trend + permission/effort split.
  app.get<{ Reply: FreedomPro | { error: string } }>('/api/freedom/pro', async (req, reply) => {
    const userId = req.tgUser!.id;
    if (!isPro(userId)) {
      reply.code(402);
      return { error: 'pro required' };
    }

    const events = await listEvents(userId);
    const weeks = new Map<string, FreedomBucket>();
    const months = new Map<string, FreedomBucket>();
    for (const e of events) {
      const w = startOfWeek(e.createdAt);
      const m = startOfMonth(e.createdAt);
      for (const [key, map] of [
        [w, weeks],
        [m, months]
      ] as const) {
        const b = map.get(key) ?? { startsAt: key, count: 0, value: 0, selfPermissions: 0 };
        b.count++;
        b.value += e.value;
        if (e.belowThreshold) b.selfPermissions++;
        map.set(key, b);
      }
    }

    const steps = await listStepsByUser(userId);
    let permissionStepsDone = 0;
    let effortStepsDone = 0;
    for (const s of steps) {
      if (!s.done) continue;
      if (s.category === 'effort') effortStepsDone++;
      else permissionStepsDone++;
    }

    return {
      weeks: Array.from(weeks.values())
        .sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1))
        .slice(-12),
      months: Array.from(months.values())
        .sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1))
        .slice(-12),
      permissionStepsDone,
      effortStepsDone
    };
  });
}
