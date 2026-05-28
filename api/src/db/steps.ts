import { randomUUID } from 'node:crypto';
import type { Step, StepCategory, StepKind } from '@afford/shared';
import { hashDel, hashGetAll, hashSet } from '../lib/hashStore.js';

const REDIS_KEY = 'afford:steps';
const steps = new Map<string, Step>();

function persist(s: Step) { hashSet(REDIS_KEY, s.id, JSON.stringify(s)); }

export async function loadStepsFromRedis(): Promise<void> {
  const map = await hashGetAll<Step>(REDIS_KEY);
  for (const s of Object.values(map)) steps.set(s.id, s);
  console.log(`[steps] loaded ${steps.size} step(s) from redis`);
}

export async function listSteps(userId: number, wishId: string): Promise<Step[]> {
  const out: Step[] = [];
  for (const s of steps.values()) {
    if (s.userId === userId && s.wishId === wishId) out.push(s);
  }
  // not-done first, then by creation time
  out.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
  return out;
}

export async function listStepsByUser(userId: number): Promise<Step[]> {
  const out: Step[] = [];
  for (const s of steps.values()) {
    if (s.userId === userId) out.push(s);
  }
  return out;
}

export async function wipeStepsForUser(userId: number): Promise<void> {
  const ids: string[] = [];
  for (const [id, s] of steps.entries()) {
    if (s.userId === userId) ids.push(id);
  }
  for (const id of ids) {
    steps.delete(id);
    hashDel('afford:steps', id);
  }
}

export async function createStep(
  userId: number,
  wishId: string,
  title: string,
  points: number,
  kind: StepKind = 'step',
  category: StepCategory = 'permission'
): Promise<Step> {
  const step: Step = {
    id: randomUUID(),
    userId,
    wishId,
    title: title.trim(),
    kind,
    category,
    points,
    done: false,
    doneAt: null,
    createdAt: new Date().toISOString()
  };
  steps.set(step.id, step);
  persist(step);
  return step;
}

export async function getStep(stepId: string): Promise<Step | null> {
  return steps.get(stepId) ?? null;
}

export async function markStepDone(userId: number, stepId: string): Promise<Step | null> {
  const s = steps.get(stepId);
  if (!s || s.userId !== userId || s.done) return null;
  s.done = true;
  s.doneAt = new Date().toISOString();
  persist(s);
  return s;
}
