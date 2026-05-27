import type { FastifyInstance } from 'fastify';
import type { InterpretationMode, MeResponse, UserSettings } from '@afford/shared';
import { verifyInitData } from '../lib/verifyInitData.js';
import { upsertUserFromTelegram, updateUserSettings } from '../db/users.js';
import { requireUser } from '../lib/requireUser.js';
import { env } from '../env.js';

interface MeBody {
  initData?: string;
}

const VALID_INTERPRETATIONS: InterpretationMode[] = ['permission', 'effort', 'both'];

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

  // PATCH user.settings — soft personalisation (interpretation lens, etc).
  app.patch<{
    Body: Partial<UserSettings>;
    Reply: MeResponse | { error: string };
  }>('/api/me/settings', { preHandler: requireUser }, async (req, reply) => {
    const userId = req.tgUser!.id;
    const patch = req.body ?? {};

    // Validate known keys; ignore unknown.
    const clean: Partial<UserSettings> = {};
    if (patch.interpretation !== undefined) {
      if (!VALID_INTERPRETATIONS.includes(patch.interpretation as InterpretationMode)) {
        reply.code(400);
        return { error: 'invalid interpretation' };
      }
      clean.interpretation = patch.interpretation;
    }
    if (typeof patch.notificationsEnabled === 'boolean') {
      clean.notificationsEnabled = patch.notificationsEnabled;
    }

    const user = await updateUserSettings(userId, clean);
    if (!user) {
      reply.code(404);
      return { error: 'user not found' };
    }
    return { user, unlocked: user.subscriptionStatus === 'active' };
  });
}
