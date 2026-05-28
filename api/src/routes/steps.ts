import type { FastifyInstance } from 'fastify';
import type {
  MicroPermissionPack,
  MicroPermissionTemplate,
  Step,
  StepCategory,
  Wish
} from '@afford/shared';
import { PRO_PACK_TEMPLATES, PRO_PACKS } from '../db/microPacks.js';
import { isPro } from '../lib/proStatus.js';
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

  app.get<{
    Querystring: { pack?: string };
    Reply: { templates: MicroPermissionTemplate[] };
  }>('/api/micro-permissions', async (req) => {
    const pack = req.query?.pack;
    if (!pack || pack === 'default') {
      return { templates: MICRO_TEMPLATES.map((t) => ({ ...t, pack: 'default' })) };
    }
    // Pro pack — only return items if the user is unlocked.
    const userId = req.tgUser!.id;
    if (!isPro(userId)) return { templates: [] };
    return { templates: PRO_PACK_TEMPLATES.filter((t) => t.pack === pack) };
  });

  app.get<{ Reply: { packs: MicroPermissionPack[] } }>(
    '/api/micro-permissions/packs',
    async () => {
      const defaultPack: MicroPermissionPack = {
        id: 'default',
        title: 'общая библиотека',
        description: '110+ универсальных шагов — позволения и труд во всех сферах.',
        isPremium: false,
        count: MICRO_TEMPLATES.length
      };
      return { packs: [defaultPack, ...PRO_PACKS.map((p) => p.meta)] };
    }
  );
}
