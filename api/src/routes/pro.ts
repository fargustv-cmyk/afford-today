// Pro purchase via Telegram Stars. Single endpoint that creates an invoice
// link for the current user; payment lands in routes/telegram.ts webhook.
//
// Pattern lifted from converter++: payload carries our userId so the webhook
// can verify from.id against it (prevents a forged update from granting Pro
// to someone else).
import type { FastifyInstance } from 'fastify';
import { env } from '../env.js';
import { isPro } from '../lib/proStatus.js';

interface InvoiceReply {
  url: string;
  alreadyPro?: boolean;
}

export async function proRoutes(app: FastifyInstance) {
  app.post<{ Reply: InvoiceReply | { error: string } }>(
    '/api/pro/invoice',
    async (req, reply) => {
      const userId = req.tgUser!.id;
      if (isPro(userId)) {
        return { url: '', alreadyPro: true };
      }
      if (!env.BOT_TOKEN) {
        reply.code(500);
        return { error: 'billing disabled' };
      }
      const payload = `pro:${userId}:${Date.now()}`;
      const body = {
        title: 'afford.today Pro',
        description:
          'Несколько вишлистов, тематические пакеты шагов, избранные шаги, расширенная карта свободы и темы оформления. Разово — навсегда, без подписки.',
        payload,
        currency: 'XTR',
        prices: [{ label: 'Pro', amount: env.STARS_PRICE }]
      };
      const r = await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/createInvoiceLink`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      const j = (await r.json()) as { ok: boolean; result?: string; description?: string };
      if (!j.ok || !j.result) {
        console.warn('[pro] createInvoiceLink failed:', j);
        reply.code(502);
        return { error: 'invoice failed' };
      }
      return { url: j.result };
    }
  );
}
