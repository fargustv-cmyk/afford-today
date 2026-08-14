import type { FastifyInstance } from 'fastify';
import type { InterpretationMode, MeResponse, ThemeId, UserSettings } from '@afford/shared';
import { verifyInitData } from '../lib/verifyInitData.js';
import { upsertUserFromTelegram, updateUserSettings } from '../db/users.js';
import { requireUser } from '../lib/requireUser.js';
import { env } from '../env.js';
import { isPro } from '../lib/proStatus.js';
import { trackProductEvent } from '../lib/analytics.js';

interface MeBody {
  initData?: string;
}

const VALID_INTERPRETATIONS: InterpretationMode[] = ['permission', 'effort', 'both'];
const VALID_THEMES: ThemeId[] = ['default', 'night', 'forest', 'paper'];

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: MeBody; Reply: MeResponse | { error: string } }>('/api/me', async (req, reply) => {
    const tg = verifyInitData(req.body?.initData ?? '', env.BOT_TOKEN);
    if (!tg) {
      reply.code(401);
      return { error: 'Unauthorized' };
    }
    const user = await upsertUserFromTelegram(tg);
    trackProductEvent('session_started');
    return { user, unlocked: isPro(user.id) };
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
    if (patch.theme !== undefined) {
      if (!VALID_THEMES.includes(patch.theme as ThemeId)) {
        reply.code(400);
        return { error: 'invalid theme' };
      }
      // Non-default themes are Pro. Free users silently snap back to default.
      const proUser = isPro(userId);
      clean.theme = patch.theme === 'default' || proUser ? (patch.theme as ThemeId) : 'default';
    }

    const user = await updateUserSettings(userId, clean);
    if (!user) {
      reply.code(404);
      return { error: 'user not found' };
    }
    return { user, unlocked: isPro(user.id) };
  });
}
