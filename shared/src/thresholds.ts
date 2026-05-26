// Points thresholds per SPEC §4. Defaults are in RUB (T1=3000, T2=30000).
// Currency-agnostic at the API surface; for non-RUB we either convert or let the
// user override via settings. MVP only ships RUB defaults — see SPEC.

import type { WishType } from './types.js';

export const STEP_POINTS = {
  small: 10,
  medium: 25,
  large: 50
} as const;

export const MICRO_PERMISSION_POINTS = 15;

export const PRICE_BRACKETS_RUB = {
  T1: 3_000,
  T2: 30_000
} as const;

/**
 * Compute points_required for a wish at creation time.
 *   essential → 0
 *   need      → 20
 *   want cheap  (below T1)  → 100
 *   want medium (T1–T2)     → 300
 *   want expensive (≥ T2)   → 800
 *
 * @param type wish type
 * @param price wish price (in the same currency as brackets — RUB for MVP)
 * @param factor self_permission_factor multiplier (post-MVP "melting threshold"),
 *               default 1.0; floored at 0.4 per schema CHECK.
 */
export function pointsRequiredFor(
  type: WishType,
  price: number | null,
  factor = 1
): number {
  if (type === 'essential') return 0;
  if (type === 'need') return Math.round(20 * factor);

  // want
  const base =
    price == null
      ? 100
      : price < PRICE_BRACKETS_RUB.T1
        ? 100
        : price < PRICE_BRACKETS_RUB.T2
          ? 300
          : 800;
  return Math.round(base * factor);
}
