import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { env, assertProductionEnv } from './env.js';
import { authRoutes } from './routes/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildApp() {
  const app = Fastify({
    logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' },
    bodyLimit: 256 * 1024 // 256 KB — we don't accept large bodies
  });

  app.addHook('onSend', async (_req, reply) => {
    // Mini App caching is a known landmine; force fresh fetches.
    reply.header('Cache-Control', 'no-store, must-revalidate');
  });

  await app.register(authRoutes);

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
