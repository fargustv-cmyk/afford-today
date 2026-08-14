import { hashGetAll, hashIncrBy } from './hashStore.js';

export type ProductEvent =
  | 'session_started'
  | 'wish_created'
  | 'wish_allowed'
  | 'wish_postponed'
  | 'wish_purchased'
  | 'action_completed'
  | 'checkin_created'
  | 'share_created'
  | 'pro_paid';

// Aggregate-only product analytics. No Telegram id, wish title, price or
// check-in content is recorded here. The hash is enough to see whether the
// core funnel works before introducing a third-party analytics vendor.
export function trackProductEvent(event: ProductEvent): void {
  hashIncrBy('afford:analytics:v1', event, 1);
}

const PRODUCT_EVENTS: ProductEvent[] = [
  'session_started',
  'wish_created',
  'wish_allowed',
  'wish_postponed',
  'wish_purchased',
  'action_completed',
  'checkin_created',
  'share_created',
  'pro_paid'
];

export async function readProductEvents(): Promise<Record<ProductEvent, number>> {
  const stored = await hashGetAll<number>('afford:analytics:v1');
  return Object.fromEntries(
    PRODUCT_EVENTS.map((event) => [event, Number(stored[event]) || 0])
  ) as Record<ProductEvent, number>;
}
