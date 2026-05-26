// Placeholder bot. Wiring for nudges + deep-links lands in prompt 8.
// Kept as its own workspace + process so it can be deployed to a Render
// Background Worker without affecting the web /api dyno.

import 'dotenv/config';
import { Bot } from 'grammy';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.warn('BOT_TOKEN not set — bot exits cleanly. (This is fine before prompt 8.)');
  process.exit(0);
}

const bot = new Bot(token);

bot.command('start', async (ctx) => {
  await ctx.reply('afford.today — твоё личное «можно». Открывай мини-апп ↓');
});

bot.start();
console.log('afford.today bot started (long polling)');
