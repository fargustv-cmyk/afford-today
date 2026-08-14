import { hashIncrBy } from './hashStore.js';

export type ProductEvent =
  | 'session_started'
  | 'wish_created'
  | 'wish_allowed'
  | 'wish_purchased'
  | 'checkin_created'
  | 'share_created'
  | 'pro_paid';

// Aggregate-only product analytics. No Telegram id, wish title, price or
// check-in content is recorded here. The hash is enough to see whether the
// core funnel works before introducing a third-party analytics vendor.
export function trackProductEvent(event: ProductEvent): void {
  hashIncrBy('afford:analytics:v1', event, 1);
}
