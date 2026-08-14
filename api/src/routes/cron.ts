import type { FastifyInstance } from 'fastify';
import { env } from '../env.js';
import { listAllUsers } from '../db/users.js';
import { getWishStateCounts, listActiveWishes } from '../db/wishes.js';
import { notifyNudge } from '../lib/notifications.js';
import { wasNudgedRecently, markNudged } from '../db/nudgeLog.js';
import { readProductEvents } from '../lib/analytics.js';

export async function cronRoutes(app: FastifyInstance) {
  // Daily nudge runner — protected by a shared secret, triggered externally
  // (cron-job.org / Render cron / curl). We don't run a long-lived process
  // on the free tier; the scheduler lives outside.
  app.post('/api/cron/daily-nudge', async (req, reply) => {
    const secret = env.CRON_SECRET;
    if (!secret) {
      reply.code(503);
      return { error: 'cron not configured' };
    }
    const auth = (req.headers.authorization as string | undefined) ?? '';
    if (auth !== `Bearer ${secret}`) {
      reply.code(401);
      return { error: 'unauthorized' };
    }

    const users = await listAllUsers();
    let candidates = 0;
    let sent = 0;
    let skipped = 0;

    for (const u of users) {
      candidates++;
      if (u.settings.notificationsEnabled !== true) {
        skipped++;
        continue;
      }
      if (await wasNudgedRecently(u.id)) {
        skipped++;
        continue;
      }
      const wishes = await listActiveWishes(u.id);
      let nudgedFor: string | null = null;
      for (const w of wishes) {
        if (w.status !== 'active' || !w.postponedAt) continue;
        const age = Date.now() - new Date(w.postponedAt).getTime();
        if (age < 3 * 24 * 60 * 60 * 1000) continue;
        const ok = await notifyNudge(u.id, w);
        if (ok) {
          nudgedFor = w.id;
          break;
        }
      }
      if (nudgedFor) {
        await markNudged(u.id);
        sent++;
      }
    }

    return { candidates, sent, skipped };
  });

  app.get('/api/admin/product-metrics', async (req, reply) => {
    const secret = env.CRON_SECRET;
    if (!secret) {
      reply.code(503);
      return { error: 'metrics not configured' };
    }
    if (req.headers.authorization !== `Bearer ${secret}`) {
      reply.code(401);
      return { error: 'unauthorized' };
    }
    return {
      events: await readProductEvents(),
      currentWishes: getWishStateCounts(),
      generatedAt: new Date().toISOString()
    };
  });
}
