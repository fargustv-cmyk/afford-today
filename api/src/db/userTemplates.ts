// Pro-only personal step library. When a user makes a step they want to reuse
// (e.g. «выпить два стакана воды»), they can pin it — it shows up in future
// smart-picks ahead of the curated library. Free users don't see the pin
// affordance; the gate is enforced server-side too.

import { randomUUID } from 'node:crypto';
import type { LifeDomain, StepCategory, UserStepTemplate } from '@afford/shared';
import { hashDel, hashGetAll, hashSet } from '../lib/hashStore.js';

const REDIS_KEY = 'afford:userTemplates';
const userTemplates = new Map<string, UserStepTemplate>();

function persist(t: UserStepTemplate) { hashSet(REDIS_KEY, t.id, JSON.stringify(t)); }

export async function loadUserTemplatesFromRedis(): Promise<void> {
  const map = await hashGetAll<UserStepTemplate>(REDIS_KEY);
  for (const t of Object.values(map)) userTemplates.set(t.id, t);
  console.log(`[userTemplates] loaded ${userTemplates.size} template(s) from redis`);
}

export async function listUserTemplates(userId: number): Promise<UserStepTemplate[]> {
  const out: UserStepTemplate[] = [];
  for (const t of userTemplates.values()) if (t.userId === userId) out.push(t);
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
}

export async function createUserTemplate(
  userId: number,
  title: string,
  suggestedPoints: number,
  domain: LifeDomain,
  category: StepCategory
): Promise<UserStepTemplate> {
  const t: UserStepTemplate = {
    id: randomUUID(),
    userId,
    title: title.trim(),
    suggestedPoints,
    domain,
    category,
    createdAt: new Date().toISOString()
  };
  userTemplates.set(t.id, t);
  persist(t);
  return t;
}

export async function deleteUserTemplate(userId: number, id: string): Promise<boolean> {
  const t = userTemplates.get(id);
  if (!t || t.userId !== userId) return false;
  userTemplates.delete(id);
  hashDel(REDIS_KEY, id);
  return true;
}

export async function wipeUserTemplatesForUser(userId: number): Promise<void> {
  const ids: string[] = [];
  for (const [id, t] of userTemplates.entries()) {
    if (t.userId === userId) ids.push(id);
  }
  for (const id of ids) {
    userTemplates.delete(id);
    hashDel(REDIS_KEY, id);
  }
}
