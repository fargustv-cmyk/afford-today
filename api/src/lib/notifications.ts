import type { Wish } from '@afford/shared';
import { env } from '../env.js';
import { sendBotMessage, escapeHtml } from './botSend.js';

// SPEC §6: tone is "soft companion", never guilt. No "ты опять ничего не сделал".

export async function notifyUnlock(wish: Wish): Promise<boolean> {
  return sendBotMessage({
    chatId: wish.userId,
    text:
      `Шкала по <b>${escapeHtml(wish.title)}</b> заполнена.\n` +
      `Официально — можно. Иди забирай.`,
    webAppUrl: env.PUBLIC_APP_URL,
    buttonText: 'открыть'
  });
}

export async function notifyNudge(userId: number, wish: Wish): Promise<boolean> {
  return sendBotMessage({
    chatId: userId,
    text:
      `В твоём вишлисте — <b>${escapeHtml(wish.title)}</b>.\n` +
      `Маленький шаг сегодня — и шкала чуть-чуть пополнее. Без спешки.`,
    webAppUrl: env.PUBLIC_APP_URL,
    buttonText: 'сделать шаг'
  });
}
