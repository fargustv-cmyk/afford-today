import { randomUUID } from 'node:crypto';
import type { LifeDomain, PermissionEvent } from '@afford/shared';

const events: PermissionEvent[] = [];

export async function listEvents(userId: number): Promise<PermissionEvent[]> {
  return events.filter((e) => e.userId === userId);
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
  return event;
}
