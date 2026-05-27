import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  BOT_TOKEN: optional('BOT_TOKEN'),
  // Resolved relative to api/dist/server.js → ../../app/dist = repo-root/app/dist
  STATIC_DIR: optional('STATIC_DIR', '../../app/dist'),
  DATABASE_URL: optional('DATABASE_URL'),
  PUBLIC_APP_URL: optional('PUBLIC_APP_URL', 'https://afford-today.onrender.com'),
  CRON_SECRET: optional('CRON_SECRET'),
  OG_TEST_TOKEN: optional('OG_TEST_TOKEN'), // если задан — /api/og?test=<token>&url=… работает без initData
  TG_WEBHOOK_SECRET: optional('TG_WEBHOOK_SECRET'), // секрет, который Telegram присылает в X-Telegram-Bot-Api-Secret-Token
  NODE_ENV: optional('NODE_ENV', 'development')
};

export function assertProductionEnv() {
  // Lazy: only blow up when something tries to do work that needs a token.
  // The Mini App can still render the shell without BOT_TOKEN locally.
  if (!env.BOT_TOKEN && env.NODE_ENV === 'production') {
    throw new Error('BOT_TOKEN required in production');
  }
}
