import type { FastifyInstance } from 'fastify';
import type { UserFreedom } from '@afford/shared';
import { getUserFreedom } from '../db/permissionEvents.js';

export async function freedomRoutes(app: FastifyInstance) {
  app.get<{ Reply: UserFreedom }>('/api/freedom', async (req) => {
    return getUserFreedom(req.tgUser!.id);
  });
}
