// All user-facing copy lives here per CLAUDE.md.
// Tone: cheeky supportive friend; no clinical / wound language.

export const ru = {
  scaffold_subtitle: 'твоё личное «можно»',
  scaffold_loading: 'секунду…',
  scaffold_no_telegram: 'открой через бота в Telegram — оттуда узнаю тебя.',
  scaffold_unauthorized: 'не получилось проверить твою сессию. перезагрузи мини-апп.',
  scaffold_greet: 'привет, {name}. готов(а) к маленькому «можно»?'
} as const;

export type RuKey = keyof typeof ru;
