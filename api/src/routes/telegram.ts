// Telegram bot webhook. Handles `/start` — the only command the bot needs.
// Reply is a single message with a web_app button that opens the Mini App
// inside Telegram. Everything else (Mini App auth, data) flows through
// initData on the WebApp side.
import type { FastifyInstance } from 'fastify';
import { env } from '../env.js';
import { sendBotMessage } from '../lib/botSend.js';
import { markPaid } from '../lib/proStatus.js';

interface TgChat { id: number; type: string }
interface TgFrom { id: number; language_code?: string }
interface TgSuccessfulPayment { invoice_payload: string; total_amount: number; currency: string }
interface TgMessage {
  chat: TgChat;
  text?: string;
  from?: TgFrom;
  successful_payment?: TgSuccessfulPayment;
}
interface TgPreCheckoutQuery { id: string; from: TgFrom; invoice_payload: string }
interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  pre_checkout_query?: TgPreCheckoutQuery;
}

const WELCOME = [
  'привет!',
  '',
  'афорд тудей — твоё личное «можно». добавь то, что хочется. сделай пару шагов или просто разреши себе.',
  '',
  'базовое (еда, лекарства, гигиена) — сразу можно, без шагов.',
  '',
  'жми кнопку ниже.'
].join('\n');

const PRO_PITCH = [
  'Pro · 100 ⭐ навсегда — пять фич одной разовой покупкой:',
  '',
  '• несколько вишлистов («на отпуск», «дом», «себе вкусненького»)',
  '• 4 тематических пакета шагов («после выгорания», «первая зарплата», «вечерний ритуал», «после расставания»)',
  '• избранные шаги — свои частые штуки в личной библиотеке',
  '• карта свободы Pro — тренды по неделям и месяцам',
  '• 4 темы оформления — тёплая, ночь, лес, бумага',
  '',
  'без подписки. открой приложение и нажми «купить Pro».'
].join('\n');

export async function telegramRoutes(app: FastifyInstance) {
  app.post('/api/telegram/webhook', async (req, reply) => {
    // Telegram authenticates by echoing back the secret we set on setWebhook.
    // If the secret is missing in production, fail closed — without it anyone
    // could POST a synthetic successful_payment update and unlock free Pro.
    if (!env.TG_WEBHOOK_SECRET) {
      if (env.NODE_ENV === 'production') {
        reply.code(503);
        return { ok: false, error: 'webhook secret not configured' };
      }
    } else {
      const got = req.headers['x-telegram-bot-api-secret-token'];
      if (got !== env.TG_WEBHOOK_SECRET) {
        reply.code(401);
        return { ok: false };
      }
    }
    const upd = req.body as TgUpdate | undefined;

    // Stars pre-checkout: must answer within 10s.
    if (upd?.pre_checkout_query) {
      await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/answerPreCheckoutQuery`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pre_checkout_query_id: upd.pre_checkout_query.id, ok: true })
        }
      ).catch((e) => console.warn('[bot] answerPreCheckoutQuery failed', e));
    }

    const msg = upd?.message;
    if (!msg) return { ok: true };

    // Successful Stars payment → unlock Pro.
    if (msg.successful_payment?.invoice_payload?.startsWith('pro:')) {
      const [, payloadUserId] = msg.successful_payment.invoice_payload.split(':');
      const fromId = msg.from?.id;
      if (fromId && Number(payloadUserId) === fromId) {
        await markPaid(fromId);
        await sendBotMessage({
          chatId: msg.chat.id,
          text: 'Pro активирован 🤍\n\nвишлисты, пакеты шагов, избранное, карта свободы Pro и темы — твои. спасибо!',
          webAppUrl: env.PUBLIC_APP_URL,
          buttonText: 'открыть'
        });
      } else {
        console.warn('[pro] payment payload mismatch', { payloadUserId, fromId });
      }
      return { ok: true };
    }

    if (!msg.text) return { ok: true };
    const text = msg.text.trim();
    if (text === '/start' || text.startsWith('/start ')) {
      await sendBotMessage({
        chatId: msg.chat.id,
        text: WELCOME,
        webAppUrl: env.PUBLIC_APP_URL,
        buttonText: 'открыть афорд'
      });
    } else if (text === '/pro') {
      await sendBotMessage({
        chatId: msg.chat.id,
        text: PRO_PITCH,
        webAppUrl: env.PUBLIC_APP_URL,
        buttonText: 'открыть'
      });
    }
    return { ok: true };
  });
}
