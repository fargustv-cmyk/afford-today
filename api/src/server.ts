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
    if (
      req.url.startsWith('/api/wishes') ||
      req.url.startsWith('/api/steps') ||
      req.url.startsWith('/api/micro-permissions') ||
      req.url.startsWith('/api/og') ||
      req.url.startsWith('/api/freedom')
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
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api/')) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }
    reply.sendFile('index.html', staticRoot);
  });

  return app;
}

assertProductionEnv();

const app = await buildApp();
await app.listen({ host: '0.0.0.0', port: env.PORT });
app.log.info(`afford.today api listening on :${env.PORT}`);
