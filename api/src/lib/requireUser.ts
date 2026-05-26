import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyInitData, type TgUser } from './verifyInitData.js';
import { env } from '../env.js';

declare module 'fastify' {
  interface FastifyRequest {
    tgUser?: TgUser;
  }
}

/**
 * Fastify preHandler: extract & verify initData, attach `req.tgUser`.
 * initData can come from header `x-init-data` (preferred) or from JSON body
 * for legacy callers. Fails closed with 401.
 */
export async function requireUser(req: FastifyRequest, reply: FastifyReply) {
  const fromHeader = (req.headers['x-init-data'] as string | undefined) ?? '';
  const fromBody = ((req.body as Record<string, unknown> | undefined)?.initData as string | undefined) ?? '';
  const initData = fromHeader || fromBody;
  const tg = verifyInitData(initData, env.BOT_TOKEN);
  if (!tg) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  req.tgUser = tg;
}
