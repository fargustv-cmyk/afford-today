import type { FastifyInstance } from 'fastify';
import type {
  LifeDomain,
  MicroPermissionPack,
  MicroPermissionTemplate,
  Step,
  StepCategory,
  UserStepTemplate,
  Wish
} from '@afford/shared';
import { PRO_PACK_TEMPLATES, PRO_PACKS } from '../db/microPacks.js';
import { isPro } from '../lib/proStatus.js';
import { createStep, listSteps, markStepDone, getStep } from '../db/steps.js';
import { getWishById, addPointsToWish } from '../db/wishes.js';
import { MICRO_TEMPLATES } from '../db/microPermissions.js';
import {
  createUserTemplate,
  deleteUserTemplate,
  listUserTemplates
} from '../db/userTemplates.js';

// Manual step UI offers 10/25/50; library templates use the full 10–30 range.
// Accept any sane positive integer so template taps don't 400 silently.
const isValidPoints = (n: unknown): n is number =>
  typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 100;
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
    if (!isValidPoints(points)) {
      reply.code(400);
      return { error: 'points must be a positive integer between 1 and 100' };
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

  // Pro: list / create / delete personal step templates.
  app.get<{ Reply: { templates: UserStepTemplate[] } | { error: string } }>(
    '/api/user-templates',
    async (req, reply) => {
      const userId = req.tgUser!.id;
      if (!isPro(userId)) {
        reply.code(402);
        return { error: 'pro required' };
      }
      const templates = await listUserTemplates(userId);
      return { templates };
    }
  );

  app.post<{
    Body: { title: string; points: number; domain: LifeDomain; category: StepCategory };
    Reply: { template: UserStepTemplate } | { error: string };
  }>('/api/user-templates', async (req, reply) => {
    const userId = req.tgUser!.id;
    if (!isPro(userId)) {
      reply.code(402);
      return { error: 'pro required' };
    }
    const { title, points, domain, category } = req.body ?? ({} as Record<string, unknown>);
    if (!title || typeof title !== 'string' || !title.trim()) {
      reply.code(400);
      return { error: 'title required' };
    }
    if (!isValidPoints(points)) {
      reply.code(400);
      return { error: 'points out of range' };
    }
    const validDomain: LifeDomain[] = ['clothes', 'leisure', 'comfort', 'health', 'joy', 'food', 'other'];
    if (!validDomain.includes(domain as LifeDomain)) {
      reply.code(400);
      return { error: 'invalid domain' };
    }
    const cat: StepCategory =
      category && VALID_CATEGORIES.includes(category as StepCategory) ? (category as StepCategory) : 'permission';
    const t = await createUserTemplate(userId, title, points, domain as LifeDomain, cat);
    return { template: t };
  });

  app.delete<{ Params: { id: string }; Reply: { ok: true } | { error: string } }>(
    '/api/user-templates/:id',
    async (req, reply) => {
      const userId = req.tgUser!.id;
      if (!isPro(userId)) {
        reply.code(402);
        return { error: 'pro required' };
      }
      const ok = await deleteUserTemplate(userId, req.params.id);
      if (!ok) {
        reply.code(404);
        return { error: 'template not found' };
      }
      return { ok: true };
    }
  );

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
