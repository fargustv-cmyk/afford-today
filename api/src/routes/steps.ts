import type { FastifyInstance } from 'fastify';
import type { Step, StepCategory, Wish, MicroPermissionTemplate } from '@afford/shared';
import { createStep, listSteps, markStepDone, getStep } from '../db/steps.js';
import { getWishById, addPointsToWish } from '../db/wishes.js';
import { MICRO_TEMPLATES } from '../db/microPermissions.js';

const VALID_POINTS = new Set([10, 25, 50]);
const VALID_CATEGORIES: StepCategory[] = ['permission', 'effort'];

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
    Body: { title: string; points: number; category?: StepCategory };
    Reply: { step: Step } | { error: string };
  }>('/api/wishes/:wishId/steps', async (req, reply) => {
    const userId = req.tgUser!.id;
    const wish = await getWishById(req.params.wishId);
    if (!wish || wish.userId !== userId) {
      reply.code(404);
      return { error: 'wish not found' };
    }
    const { title, points, category } = req.body ?? ({} as { title?: string; points?: number; category?: StepCategory });
    if (!title || typeof title !== 'string' || !title.trim()) {
      reply.code(400);
      return { error: 'title required' };
    }
    if (typeof points !== 'number' || !VALID_POINTS.has(points)) {
      reply.code(400);
      return { error: 'points must be 10, 25 or 50' };
    }
    const cat: StepCategory = category && VALID_CATEGORIES.includes(category) ? category : 'permission';
    const step = await createStep(userId, req.params.wishId, title, points, 'step', cat);
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
}
