import type { FastifyInstance } from 'fastify';
import type { Step, Wish, MicroPermissionTemplate } from '@afford/shared';
import { createStep, listSteps, markStepDone, getStep } from '../db/steps.js';
import { getWishById, addPointsToWish } from '../db/wishes.js';
import { MICRO_TEMPLATES, getMicroTemplate } from '../db/microPermissions.js';

const VALID_POINTS = new Set([10, 25, 50]);

export async function stepsRoutes(app: FastifyInstance) {
  app.get<{ Params: { wishId: string }; Reply: { steps: Step[] } | { error: string } }>(
    '/api/wishes/:wishId/steps',
    async (req, reply) => {
      const userId = req.tgUser!.id;
      const wish = await getWishById(req.params.wishId);
      if (!wish || wish.userId !== userId) {
        reply.code(404);
        return { error: 'wish not found' };
      }
      const steps = await listSteps(userId, req.params.wishId);
      return { steps };
    }
  );

  app.post<{
    Params: { wishId: string };
    Body: { title: string; points: number };
    Reply: { step: Step } | { error: string };
  }>('/api/wishes/:wishId/steps', async (req, reply) => {
    const userId = req.tgUser!.id;
    const wish = await getWishById(req.params.wishId);
    if (!wish || wish.userId !== userId) {
      reply.code(404);
      return { error: 'wish not found' };
    }
    const { title, points } = req.body ?? ({} as { title?: string; points?: number });
    if (!title || typeof title !== 'string' || !title.trim()) {
      reply.code(400);
      return { error: 'title required' };
    }
    if (typeof points !== 'number' || !VALID_POINTS.has(points)) {
      reply.code(400);
      return { error: 'points must be 10, 25 or 50' };
    }
    const step = await createStep(userId, req.params.wishId, title, points);
    return { step };
  });

  app.post<{
    Params: { stepId: string };
    Reply: { step: Step; wish: Wish | null } | { error: string };
  }>('/api/steps/:stepId/done', async (req, reply) => {
    const userId = req.tgUser!.id;
    const existing = await getStep(req.params.stepId);
    if (!existing || existing.userId !== userId) {
      reply.code(404);
      return { error: 'step not found' };
    }
    const step = await markStepDone(userId, req.params.stepId);
    if (!step) {
      // Already done — return current state idempotently
      const wish = existing.wishId ? await getWishById(existing.wishId) : null;
      return { step: existing, wish };
    }
    const wish = step.wishId ? await addPointsToWish(step.wishId, step.points) : null;
    return { step, wish };
  });

  app.get<{ Reply: { templates: MicroPermissionTemplate[] } }>(
    '/api/micro-permissions',
    async () => ({ templates: MICRO_TEMPLATES })
  );

  app.post<{
    Params: { wishId: string; templateId: string };
    Reply: { step: Step; wish: Wish | null } | { error: string };
  }>('/api/wishes/:wishId/micro-permissions/:templateId/done', async (req, reply) => {
    const userId = req.tgUser!.id;
    const wish = await getWishById(req.params.wishId);
    if (!wish || wish.userId !== userId) {
      reply.code(404);
      return { error: 'wish not found' };
    }
    const tpl = getMicroTemplate(req.params.templateId);
    if (!tpl) {
      reply.code(404);
      return { error: 'template not found' };
    }
    const step = await createStep(userId, wish.id, tpl.title, tpl.suggestedPoints, 'micro_permission');
    const done = await markStepDone(userId, step.id);
    const updated = await addPointsToWish(wish.id, tpl.suggestedPoints);
    return { step: done ?? step, wish: updated };
  });
}
