import express from 'express';
import { Redis } from '@upstash/redis';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const STARS_PRICE = Number(process.env.STARS_PRICE) || 100;
const PRO_USER_IDS = new Set(
  (process.env.PRO_USER_IDS || '').split(',').map(s => Number(s.trim())).filter(Boolean)
);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res) => { res.setHeader('Cache-Control', 'no-store, must-revalidate'); }
}));

// Redis для персистентности купивших Pro. Если env-переменные не заданы —
// работаем только в памяти (платежи теряются при рестарте; ОК для dev).
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
  : null;
const PAID_KEY = 'afford:paid_users';

const paidUsers = new Set();

async function loadPaidUsers() {
  if (!redis) return;
  try {
    const ids = await redis.smembers(PAID_KEY);
    for (const id of ids || []) {
      const n = Number(id);
      if (Number.isFinite(n)) paidUsers.add(n);
    }
    console.log(`Loaded ${paidUsers.size} paid user(s) from Redis`);
  } catch (err) {
    console.error('Failed to load paid users from Redis:', err);
  }
}

async function markUserPaid(userId) {
  paidUsers.add(userId);
  if (!redis) return;
  try {
    await redis.sadd(PAID_KEY, String(userId));
  } catch (err) {
    console.error('Failed to persist paid user to Redis:', err);
  }
}

function isUnlocked(userId) {
  return PRO_USER_IDS.has(userId) || paidUsers.has(userId);
}

function verifyInitData(initData) {
  if (!BOT_TOKEN || !initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (computedHash !== hash) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}

app.post('/api/me', (req, res) => {
  const user = verifyInitData(req.body?.initData);
  if (!user) return res.json({ unlocked: false });
  res.json({
    unlocked: isUnlocked(user.id),
    user: { id: user.id, first_name: user.first_name }
  });
});

app.post('/api/create-invoice', async (req, res) => {
  if (!BOT_TOKEN) {
    return res.status(400).json({ error: 'BOT_TOKEN не настроен — Stars-платежи недоступны' });
  }
  const user = verifyInitData(req.body?.initData);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'afford.today — сопровождение',
        description: 'Безлимит целей, аналитика прогресса, премиум-ритуалы. Разовая покупка.',
        payload: `unlock:${user.id}:${Date.now()}`,
        provider_token: '',
        currency: 'XTR',
        prices: [{ label: 'Pro', amount: STARS_PRICE }]
      })
    });
    const json = await response.json();
    if (!json.ok) throw new Error(JSON.stringify(json));
    res.json({ link: json.result });
  } catch (err) {
    console.error('Invoice creation failed:', err);
    res.status(500).json({ error: 'Не удалось создать счёт' });
  }
});

const webhookPath = BOT_TOKEN ? `/webhook/${BOT_TOKEN.split(':')[1] || 'tg'}` : '/webhook/disabled';
app.post(webhookPath, async (req, res) => {
  const update = req.body || {};

  if (update.pre_checkout_query) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pre_checkout_query_id: update.pre_checkout_query.id, ok: true })
      });
    } catch (err) {
      console.error('answerPreCheckoutQuery failed:', err);
    }
  }

  const payment = update.message?.successful_payment;
  if (payment && payment.invoice_payload?.startsWith('unlock:')) {
    const userId = update.message.from?.id;
    const [, payloadUserId] = payment.invoice_payload.split(':');
    if (userId && Number(payloadUserId) === userId) {
      await markUserPaid(userId);
      console.log(`Unlocked Pro for user ${userId} (${payment.total_amount} stars)`);
    } else {
      console.warn('Payment payload mismatch — ignoring', { payloadUserId, userId });
    }
  }

  res.json({ ok: true });
});

await loadPaidUsers();

app.listen(PORT, () => {
  console.log(`afford.today running on http://localhost:${PORT}`);
  if (!BOT_TOKEN) {
    console.log('⚠️  BOT_TOKEN не задан — Stars-платежи отключены.');
  } else {
    console.log(`Webhook path: ${webhookPath}`);
  }
  if (!redis) {
    console.log('⚠️  UPSTASH_REDIS_* не задан — платежи в памяти (теряются при рестарте). Только для dev.');
  } else {
    console.log(`Redis persistence active. ${PRO_USER_IDS.size} pro user(s) from env, ${paidUsers.size} paid user(s) loaded.`);
  }
});
