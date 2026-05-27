import type { FastifyInstance } from 'fastify';
import { getWishById } from '../db/wishes.js';
import { createShareToken, lookupShareToken } from '../db/shareTokens.js';
import { renderShareCardPng } from '../lib/shareCard.js';

interface ShareReply {
  imageUrl: string;
  shareUrl: string;
}

export async function shareRoutes(app: FastifyInstance) {
  // Auth-gated: mint a share token for the current user's wish.
  app.post<{ Params: { id: string }; Reply: ShareReply | { error: string } }>(
    '/api/wishes/:id/share',
    async (req, reply) => {
      const userId = req.tgUser!.id;
      const wish = await getWishById(req.params.id);
      if (!wish || wish.userId !== userId) {
        reply.code(404);
        return { error: 'wish not found' };
      }
      const token = await createShareToken(wish.id, userId);
      const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https';
      const host = req.headers.host;
      const imageUrl = `${proto}://${host}/share/${token}.png`;
      return { imageUrl, shareUrl: imageUrl };
    }
  );

  // PUBLIC: serve the PNG by token. This is what Telegram fetches when it
  // unfurls a shared link. Auth not required by design — the token itself
  // is the capability.
  app.get<{ Params: { token: string } }>('/share/:token.png', async (req, reply) => {
    const ref = await lookupShareToken(req.params.token);
    if (!ref) {
      reply.code(404).send('not found');
      return;
    }
    const wish = await getWishById(ref.wishId);
    if (!wish || wish.userId !== ref.userId) {
      reply.code(404).send('not found');
      return;
    }
    const belowThreshold = wish.pointsEarned < wish.pointsRequired;
    try {
      const png = await renderShareCardPng(wish, { belowThreshold });
      reply
        .header('Content-Type', 'image/png')
        .header('Cache-Control', 'public, max-age=86400, immutable')
        .send(png);
    } catch (err) {
      app.log.error({ err }, 'share card render failed');
      reply.code(500).send('render failed');
    }
  });
}
