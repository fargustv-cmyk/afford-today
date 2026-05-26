// Domain types shared between /app, /api, /bot.
// Mirrors schema.sql one-to-one; keep in sync when changing DB.

export type SubscriptionStatus = 'free' | 'active' | 'expired';
export type WishType = 'essential' | 'need' | 'want';
export type LifeDomain =
  | 'clothes'
  | 'leisure'
  | 'comfort'
  | 'health'
  | 'joy'
  | 'food'
  | 'other';
export type WishStatus = 'active' | 'unlocked' | 'purchased' | 'archived';
export type StepKind = 'step' | 'micro_permission';
export type Feeling =
  | 'zero_guilt'
  | 'joy'
  | 'scared_but_good'
  | 'empty'
  | 'guilt';

export interface User {
  id: number; // Telegram user id
  createdAt: string;
  currency: string; // ISO 4217
  locale: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionUntil: string | null;
  giftedTokens: number;
  selfPermissionFactor: number; // 0.4 — 1.0
  settings: Record<string, unknown>;
  // Convenience derived from initData, not stored
  firstName?: string;
}

export interface Wish {
  id: string;
  userId: number;
  title: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  price: number | null;
  currency: string;
  type: WishType;
  domain: LifeDomain;
  pointsRequired: number;
  pointsEarned: number;
  status: WishStatus;
  createdAt: string;
  unlockedAt: string | null;
  purchasedAt: string | null;
}

export interface Step {
  id: string;
  userId: number;
  wishId: string | null;
  title: string;
  kind: StepKind;
  points: number;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  wishId: string;
  feeling: Feeling;
  note: string | null;
  createdAt: string;
}

export interface PermissionEvent {
  id: string;
  userId: number;
  wishId: string | null;
  value: number;
  domain: LifeDomain;
  belowThreshold: boolean;
  createdAt: string;
}

export interface MicroPermissionTemplate {
  id: string;
  title: string;
  suggestedPoints: number;
  domain: LifeDomain;
  isPremium: boolean;
}

// API response shapes
export interface MeResponse {
  user: User;
  unlocked: boolean; // Pro / subscription flag, used by client to gate paid features
}

export interface CreateWishInput {
  title: string;
  price?: number | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  type: WishType;
  domain: LifeDomain;
  currency?: string;
}

export interface OgPreview {
  title: string | null;
  imageUrl: string | null;
  price: number | null;
}
