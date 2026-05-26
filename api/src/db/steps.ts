import { randomUUID } from 'node:crypto';
import type { Step, StepKind } from '@afford/shared';

const steps = new Map<string, Step>();

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

export async function createStep(
  userId: number,
  wishId: string,
  title: string,
  points: number,
  kind: StepKind = 'step'
): Promise<Step> {
  const step: Step = {
    id: randomUUID(),
    userId,
    wishId,
    title: title.trim(),
    kind,
    points,
    done: false,
    doneAt: null,
    createdAt: new Date().toISOString()
  };
  steps.set(step.id, step);
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
  return s;
}
