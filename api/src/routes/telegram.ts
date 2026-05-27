// Telegram bot webhook. Handles `/start` — the only command the bot needs.
// Reply is a single message with a web_app button that opens the Mini App
// inside Telegram. Everything else (Mini App auth, data) flows through
// initData on the WebApp side.
import type { FastifyInstance } from 'fastify';
import { env } from '../env.js';
import { sendBotMessage } from '../lib/botSend.js';

interface TgChat { id: number; type: string }
interface TgMessage { chat: TgChat; text?: string; from?: { language_code?: string } }
interface TgUpdate { update_id: number; message?: TgMessage }

const WELCOME = [
  'привет!',
  '',
  'афорд тудей — твоё личное «можно». добавь, что хочется. сделай пару шагов или просто разреши себе.',
  '',
  'базовое (еда, лекарства, гигиена) — сразу можно, без шагов.',
  '',
  'жми кнопку ниже.'
].join('\n');

export async function telegramRoutes(app: FastifyInstance) {
  app.post('/api/telegram/webhook', async (req, reply) => {
    // Telegram authenticates by echoing back the secret we set on setWebhook.
    if (env.TG_WEBHOOK_SECRET) {
      const got = req.headers['x-telegram-bot-api-secret-token'];
      if (got !== env.TG_WEBHOOK_SECRET) {
        reply.code(401);
        return { ok: false };
      }
    }
    const upd = req.body as TgUpdate | undefined;
    const msg = upd?.message;
    if (!msg?.text) return { ok: true };

    const text = msg.text.trim();
    if (text === '/start' || text.startsWith('/start ')) {
      await sendBotMessage({
        chatId: msg.chat.id,
        text: WELCOME,
        webAppUrl: env.PUBLIC_APP_URL,
        buttonText: 'открыть афорд'
      });
    }
    return { ok: true };
  });
}
