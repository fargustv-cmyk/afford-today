import type { FastifyInstance } from 'fastify';
import type { MeResponse } from '@afford/shared';
import { verifyInitData } from '../lib/verifyInitData.js';
import { upsertUserFromTelegram } from '../db/users.js';
import { env } from '../env.js';

interface MeBody {
  initData?: string;
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: MeBody; Reply: MeResponse | { error: string } }>('/api/me', async (req, reply) => {
    const tg = verifyInitData(req.body?.initData ?? '', env.BOT_TOKEN);
    if (!tg) {
      reply.code(401);
      return { error: 'Unauthorized' };
    }
    const user = await upsertUserFromTelegram(tg);
    return { user, unlocked: user.subscriptionStatus === 'active' };
  });
}
