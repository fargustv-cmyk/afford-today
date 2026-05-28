import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { env, assertProductionEnv } from './env.js';
import { authRoutes } from './routes/auth.js';
import { wishesRoutes } from './routes/wishes.js';
import { stepsRoutes } from './routes/steps.js';
import { shareRoutes } from './routes/share.js';
import { freedomRoutes } from './routes/freedom.js';
import { cronRoutes } from './routes/cron.js';
import { telegramRoutes } from './routes/telegram.js';
import { proRoutes } from './routes/pro.js';
import { loadPaidUsers } from './lib/proStatus.js';
import { loadWishesFromRedis } from './db/wishes.js';
import { loadStepsFromRedis } from './db/steps.js';
import { loadEventsFromRedis } from './db/permissionEvents.js';
import { loadCheckInsFromRedis } from './db/checkIns.js';
import { loadShareTokensFromRedis } from './db/shareTokens.js';
import { requireUser } from './lib/requireUser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildApp() {
  const app = Fastify({
    logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' },
    bodyLimit: 256 * 1024 // 256 KB — we don't accept large bodies
  });

  app.addHook('onSend', async (req, reply) => {
    // Mini App caching is a known landmine; force fresh fetches.
    // EXCEPT for share card PNGs which we explicitly want CDN-cached.
    if (req.url.startsWith('/share/')) return;
    reply.header('Cache-Control', 'no-store, must-revalidate');
  });

  // Auth gate for everything mutating except /api/me (which sets the user).
  app.addHook('preHandler', async (req, reply) => {
    // /api/og can also accept a debug bypass via ?test=<OG_TEST_TOKEN> when the
    // env var is configured — useful for diagnosing anti-bot behaviour on the
    // production IP. Leave OG_TEST_TOKEN unset in normal operation.
    if (req.url.startsWith('/api/og')) {
      if (env.OG_TEST_TOKEN) {
        const u = new URL(req.url, 'http://x');
        const t = u.searchParams.get('test');
        if (t && t === env.OG_TEST_TOKEN) return; // bypass auth
      }
    }
    // /api/telegram/* is open: Telegram authenticates via secret header.
    if (req.url.startsWith('/api/telegram/')) return;
    if (
      req.url.startsWith('/api/wishes') ||
      req.url.startsWith('/api/steps') ||
      req.url.startsWith('/api/micro-permissions') ||
      req.url.startsWith('/api/og') ||
      req.url.startsWith('/api/freedom') ||
      req.url.startsWith('/api/pro')
    ) {
      await requireUser(req, reply);
    }
  });

  await app.register(authRoutes);
  await app.register(wishesRoutes);
  await app.register(stepsRoutes);
  await app.register(shareRoutes);
  await app.register(freedomRoutes);
  await app.register(cronRoutes);
  await app.register(telegramRoutes);
  await app.register(proRoutes);

  app.get('/api/health', async () => ({ ok: true, ts: Date.now() }));

  // Serve the built React app. In dev you run /app via Vite on its own port.
  const staticRoot = path.resolve(__dirname, env.STATIC_DIR);
  await app.register(fastifyStatic, {
    root: staticRoot,
    prefix: '/',
    decorateReply: false,
    wildcard: false
  });

  // SPA fallback: anything that's not /api/* gets index.html.
  // Read once at boot; the bundle never changes per deploy. We avoid
  // reply.sendFile here because fastifyStatic is registered with
  // decorateReply: false, so that method isn't on the reply object.
  const indexHtml = fs.readFileSync(path.join(staticRoot, 'index.html'));
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api/')) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }
    reply.type('text/html').send(indexHtml);
  });

  return app;
}

assertProductionEnv();
await Promise.all([
  loadPaidUsers(),
  loadWishesFromRedis(),
  loadStepsFromRedis(),
  loadEventsFromRedis(),
  loadCheckInsFromRedis(),
  loadShareTokensFromRedis()
]);

const app = await buildApp();
await app.listen({ host: '0.0.0.0', port: env.PORT });
app.log.info(`afford.today api listening on :${env.PORT}`);
