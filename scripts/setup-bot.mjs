// Apply bot meta + menu button via Telegram Bot API.
// Run: BOT_TOKEN=... APP_URL=https://afford.today node scripts/setup-bot.mjs

const TOKEN = process.env.BOT_TOKEN;
const URL = process.env.APP_URL || 'https://afford.today';
if (!TOKEN) { console.error('BOT_TOKEN env required'); process.exit(1); }

async function call(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  if (j.ok) console.log('ok', method);
  else console.error('FAIL', method, j);
  return j;
}

await call('setMyName', { name: 'afford today' });
await call('setMyShortDescription', {
  short_description: 'твоё личное «можно». разреши себе тратить на себя без вины.'
});
await call('setMyDescription', {
  description:
    'афорд тудей — твой личный список «можно». добавь то, что хочется. сделай пару шагов или просто разреши себе. карта свободы покажет, сколько ты вернул(а) себе.\n\nбазовое (еда, лекарства, гигиена) — сразу можно, без шагов.\n\nPro за 100 ⭐ разово: несколько вишлистов, тематические пакеты шагов, избранные шаги, расширенная карта свободы, темы оформления. без подписки.'
});
await call('setMyCommands', {
  commands: [
    { command: 'start', description: 'открыть афорд' },
    { command: 'pro', description: 'про-версия за 100 ⭐ навсегда' }
  ]
});
await call('setChatMenuButton', {
  menu_button: { type: 'web_app', text: 'открыть', web_app: { url: URL } }
});
