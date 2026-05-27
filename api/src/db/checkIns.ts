import { randomUUID } from 'node:crypto';
import type { CheckIn, Feeling } from '@afford/shared';

// In-memory store. `note` lives here ONLY — never shared, never used for
// marketing, never returned to anyone but the owner (and even then only for
// patterns, which is post-MVP). CLAUDE.md rule #6.
const checkIns: CheckIn[] = [];

export async function createCheckIn(
  wishId: string,
  feeling: Feeling,
  note: string | null
): Promise<CheckIn> {
  const trimmed = note?.trim() || null;
  const ci: CheckIn = {
    id: randomUUID(),
    wishId,
    feeling,
    note: trimmed,
    createdAt: new Date().toISOString()
  };
  checkIns.push(ci);
  return ci;
}
