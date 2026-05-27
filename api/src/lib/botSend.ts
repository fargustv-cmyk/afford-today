// Tiny Telegram Bot API client. Used for unlock congrats + daily nudges.
// We don't run a long-polling /bot process on the free Render tier — instead
// the api service calls sendMessage directly when it needs to.

import { env } from '../env.js';

interface InlineButton {
  text: string;
  web_app: { url: string };
}

interface SendOpts {
  chatId: number;
  text: string;
  webAppUrl?: string;
  buttonText?: string;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function sendBotMessage(opts: SendOpts): Promise<boolean> {
  if (!env.BOT_TOKEN) return false;
  const body: Record<string, unknown> = {
    chat_id: opts.chatId,
    text: opts.text,
    parse_mode: 'HTML'
  };
  if (opts.webAppUrl) {
    const btn: InlineButton = { text: opts.buttonText ?? 'открыть', web_app: { url: opts.webAppUrl } };
    body.reply_markup = { inline_keyboard: [[btn]] };
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      // 403 = user blocked the bot, 400 = bad chat — both expected, log quietly.
      const text = await r.text().catch(() => '');
      console.warn(`[bot] sendMessage ${r.status}: ${text.slice(0, 200)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[bot] sendMessage error', err);
    return false;
  }
}
