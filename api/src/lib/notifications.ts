import type { Wish } from '@afford/shared';
import { env } from '../env.js';
import { sendBotMessage, escapeHtml } from './botSend.js';

// SPEC §6: tone is "soft companion", never guilt. No "ты опять ничего не сделал".

export async function notifyUnlock(wish: Wish): Promise<boolean> {
  return sendBotMessage({
    chatId: wish.userId,
    text:
      `Ты решил(а), что <b>${escapeHtml(wish.title)}</b> тебе можно.\n` +
      `Решение твоё — без шкал и чужого разрешения.`,
    webAppUrl: env.PUBLIC_APP_URL,
    buttonText: 'открыть'
  });
}

export async function notifyNudge(userId: number, wish: Wish): Promise<boolean> {
  return sendBotMessage({
    chatId: userId,
    text:
      `Ты отложил(а) <b>${escapeHtml(wish.title)}</b>.\n` +
      `Если хочется — можно спокойно проверить решение ещё раз.`,
    webAppUrl: env.PUBLIC_APP_URL,
    buttonText: 'вернуться к решению'
  });
}
