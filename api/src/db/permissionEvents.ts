import { randomUUID } from 'node:crypto';
import type { DomainAgg, LifeDomain, PermissionEvent, UserFreedom } from '@afford/shared';
import { hashDel, hashGetAll, hashSet } from '../lib/hashStore.js';

const ALL_DOMAINS: LifeDomain[] = ['clothes', 'leisure', 'comfort', 'health', 'joy', 'food', 'other'];
const REDIS_KEY = 'afford:events';

const events: PermissionEvent[] = [];

function persist(e: PermissionEvent) { hashSet(REDIS_KEY, e.id, JSON.stringify(e)); }

export async function loadEventsFromRedis(): Promise<void> {
  const map = await hashGetAll<PermissionEvent>(REDIS_KEY);
  for (const e of Object.values(map)) events.push(e);
  console.log(`[events] loaded ${events.length} event(s) from redis`);
}

export async function listEvents(userId: number): Promise<PermissionEvent[]> {
  return events.filter((e) => e.userId === userId);
}

export async function wipeEventsForUser(userId: number): Promise<void> {
  const ids: string[] = [];
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i]!.userId === userId) {
      ids.push(events[i]!.id);
      events.splice(i, 1);
    }
  }
  for (const id of ids) hashDel(REDIS_KEY, id);
}

export async function createEvent(
  userId: number,
  wishId: string | null,
  value: number,
  domain: LifeDomain,
  belowThreshold: boolean
): Promise<PermissionEvent> {
  const event: PermissionEvent = {
    id: randomUUID(),
    userId,
    wishId,
    value,
    domain,
    belowThreshold,
    createdAt: new Date().toISOString()
  };
  events.push(event);
  persist(event);
  return event;
}

// Equivalent of schema.sql `user_freedom` view + per-domain aggregation.
// Caller (routes/freedom.ts) attaches the joined `events` array.
export async function getUserFreedom(userId: number): Promise<Omit<UserFreedom, 'events'>> {
  const userEvents = events.filter((e) => e.userId === userId);

  const byDomain = Object.fromEntries(
    ALL_DOMAINS.map((d) => [d, { count: 0, value: 0, firstAt: null } as DomainAgg])
  ) as Record<LifeDomain, DomainAgg>;

  let freedomScore = 0;
  let selfPermissions = 0;
  for (const e of userEvents) {
    const agg = byDomain[e.domain];
    agg.count++;
    agg.value += e.value;
    if (!agg.firstAt || e.createdAt < agg.firstAt) agg.firstAt = e.createdAt;
    freedomScore += e.value;
    if (e.belowThreshold) selfPermissions++;
  }

  const totalPermissions = userEvents.length;
  const selfPermissionRatio = totalPermissions > 0 ? selfPermissions / totalPermissions : 0;
  return { totalPermissions, freedomScore, selfPermissions, selfPermissionRatio, byDomain };
}
