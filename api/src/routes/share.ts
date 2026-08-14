import type { FastifyInstance } from 'fastify';
import { getWishById } from '../db/wishes.js';
import { createShareToken, lookupShareToken } from '../db/shareTokens.js';
import { renderShareCardPng } from '../lib/shareCard.js';
import { trackProductEvent } from '../lib/analytics.js';
import { env } from '../env.js';

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
      const baseUrl = env.PUBLIC_APP_URL.replace(/\/$/, '');
      const imageUrl = `${baseUrl}/share/${token}.png`;
      const shareUrl = `${baseUrl}/s/${token}`;
      trackProductEvent('share_created');
      return { imageUrl, shareUrl };
    }
  );

  // Public share landing. Telegram unfurls the image, while a person who taps
  // the card gets context and a real route into the product instead of a bare
  // PNG dead end.
  app.get<{ Params: { token: string } }>('/s/:token', async (req, reply) => {
    const ref = await lookupShareToken(req.params.token);
    if (!ref) {
      reply.code(404).type('text/plain').send('not found');
      return;
    }
    const wish = await getWishById(ref.wishId);
    if (!wish || wish.userId !== ref.userId) {
      reply.code(404).type('text/plain').send('not found');
      return;
    }
    const baseUrl = env.PUBLIC_APP_URL.replace(/\/$/, '');
    const imageUrl = `${baseUrl}/share/${req.params.token}.png`;
    const pageUrl = `${baseUrl}/s/${req.params.token}`;
    const botUrl = `https://t.me/afford_today_bot?start=share_${req.params.token}`;
    const title = escapeHtml(wish.title);

    reply.type('text/html; charset=utf-8').send(`<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Можно: ${title} · afford.today</title>
    <meta name="description" content="Решение в свою пользу — без необходимости что-то заслуживать." />
    <meta property="og:title" content="Можно: ${title}" />
    <meta property="og:description" content="Решение в свою пользу — без необходимости что-то заслуживать." />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:type" content="website" />
    <style>
      *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(120% 120% at 50% -10%,#fff8ec,#f6e3c5 55%,#efd3ac);font-family:system-ui,sans-serif;color:#2b2017}.card{width:min(460px,100%);padding:34px;border-radius:28px;background:#fffdf8;text-align:center;box-shadow:0 24px 60px -35px #46280f}.mark{width:64px;height:64px;margin:0 auto 22px;border-radius:50%;display:grid;place-items:center;background:#e0533a;color:#fff;font-size:32px;font-weight:900}h1{font-size:34px;line-height:1.1;margin:0 0 12px}p{color:#7a6450;line-height:1.5;margin:0 0 24px}a{display:block;padding:16px 20px;border-radius:16px;background:#e0533a;color:#fff;text-decoration:none;font-weight:800}.brand{margin-top:18px;font-size:12px;font-weight:800;letter-spacing:.12em;color:#7a6450}
    </style>
  </head>
  <body><main class="card"><div class="mark">✓</div><h1>Можно: ${title}</h1><p>Кто-то проверил свои опоры и принял решение в свою пользу — без очков, гринда и чужого разрешения.</p><a href="${botUrl}">попробовать для себя</a><div class="brand">AFFORD.TODAY</div></main></body>
</html>`);
  });

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
