// Telegram bot webhook. Handles `/start` — the only command the bot needs.
// Reply is a single message with a web_app button that opens the Mini App
// inside Telegram. Everything else (Mini App auth, data) flows through
// initData on the WebApp side.
import type { FastifyInstance } from 'fastify';
import { env } from '../env.js';
import { sendBotMessage } from '../lib/botSend.js';
import { markPaid } from '../lib/proStatus.js';
import { wipeUser } from '../lib/userWipe.js';
import { trackProductEvent } from '../lib/analytics.js';

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
interface TgCallbackQuery {
  id: string;
  from: TgFrom;
  data?: string;
  message?: { chat: TgChat; message_id: number };
}
interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  pre_checkout_query?: TgPreCheckoutQuery;
  callback_query?: TgCallbackQuery;
}

const WELCOME = [
  'привет!',
  '',
  'afford.today помогает отличить «я не могу это купить» от «я не могу себе это разрешить».',
  '',
  'добавь покупку, проверь три опоры и прими своё решение — без очков, гринда и домашних заданий.',
  '',
  'жми кнопку ниже.'
].join('\n');

const PRO_PITCH = [
  'Pro сейчас на пересборке.',
  '',
  'основной сценарий бесплатный. мы не будем продавать лишние функции, пока они не станут по-настоящему полезными.'
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

    // Inline-button taps (e.g. /reset confirmation).
    if (upd?.callback_query) {
      await handleCallbackQuery(upd.callback_query);
      return { ok: true };
    }

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
        trackProductEvent('pro_paid');
        await sendBotMessage({
          chatId: msg.chat.id,
          text: 'Pro активирован 🤍\n\nстатус сохранён за тобой. основной сценарий остаётся бесплатным, а новые Pro-возможности появятся только после проверки пользы. спасибо!',
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
    } else if (text === '/reset') {
      // Two-step: show confirmation with inline button. Wipe happens on callback.
      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: msg.chat.id,
          text:
            'сбросить аккаунт?\n\nудалю все желания, шаги, карту свободы, вишлисты, избранное и темы оформления.\n\nPro останется — это покупка, не данные.',
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'стереть всё', callback_data: 'reset:confirm' },
                { text: 'отмена', callback_data: 'reset:cancel' }
              ]
            ]
          }
        })
      }).catch((e) => console.warn('[reset] sendMessage failed', e));
    }
    return { ok: true };
  });
}

async function handleCallbackQuery(cb: TgCallbackQuery): Promise<void> {
  // Always answer the callback first so the spinner on the button stops.
  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: cb.id })
  }).catch((e) => console.warn('[cb] answer failed', e));

  if (!cb.data || !cb.message) return;
  if (cb.data === 'reset:cancel') {
    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        text: 'окей, ничего не трогаю.'
      })
    }).catch((e) => console.warn('[cb] edit failed', e));
    return;
  }
  if (cb.data === 'reset:confirm') {
    await wipeUser(cb.from.id);
    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        text: 'готово. начинаем заново 🤍\n\nоткрой приложение — увидишь чистый старт. Pro на месте.',
        reply_markup: {
          inline_keyboard: [[{ text: 'открыть', web_app: { url: env.PUBLIC_APP_URL } }]]
        }
      })
    }).catch((e) => console.warn('[cb] edit-confirm failed', e));
  }
}
