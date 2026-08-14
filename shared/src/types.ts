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
// Psychological flavour of a step. Both flavours fill the same bar at the same
// rate; the split is just so the user can see "what I allowed myself to do"
// vs "what I did as effort" separately.
export type StepCategory = 'permission' | 'effort';
// User's preferred lens for tasks. Soft preference — affects defaults and
// ordering, never hides functionality.
export type InterpretationMode = 'permission' | 'effort' | 'both';
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
  settings: UserSettings;
  // Convenience derived from initData, not stored
  firstName?: string;
}

export type ThemeId = 'default' | 'night' | 'forest' | 'paper';

export interface UserSettings {
  interpretation?: InterpretationMode;
  notificationsEnabled?: boolean;
  theme?: ThemeId;
  [key: string]: unknown;
}

export interface MicroPermissionPack {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
  count: number;
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
  interpretation: InterpretationMode; // legacy compatibility; not used by the v0.3 core UI
  pointsRequired: number;
  pointsEarned: number;
  status: WishStatus;
  wishlistId: string | null; // null = «main» (legacy); otherwise points to Wishlist.id
  createdAt: string;
  postponedAt?: string | null;
  unlockedAt: string | null;
  purchasedAt: string | null;
}

export interface Wishlist {
  id: string;
  userId: number;
  title: string;
  isDefault: boolean; // the auto-created «main» list — can't be deleted or renamed
  createdAt: string;
}

export interface UserStepTemplate {
  id: string;
  userId: number;
  title: string;
  suggestedPoints: number;
  domain: LifeDomain;
  category: StepCategory;
  createdAt: string;
}

export interface Step {
  id: string;
  userId: number;
  wishId: string | null;
  title: string;
  kind: StepKind;
  category: StepCategory;
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
  category: StepCategory;
  isPremium: boolean;
  pack?: string; // 'default' (free) or a named premium pack
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
  interpretation?: InterpretationMode;
  currency?: string;
  wishlistId?: string | null;
}

export interface OgPreview {
  title: string | null;
  imageUrl: string | null;
  price: number | null;
}

export interface DomainAgg {
  count: number;
  value: number;
  firstAt: string | null;
}

// Mirrors schema.sql `user_freedom` view + a per-domain breakdown.
export interface UserFreedom {
  totalPermissions: number;
  freedomScore: number;
  selfPermissions: number;       // count where below_threshold = true
  selfPermissionRatio: number;   // 0..1
  byDomain: Record<LifeDomain, DomainAgg>;
  events: EnrichedEvent[];       // newest first, all domains
}

// Pro-only: weekly/monthly trends derived from PermissionEvent.
export interface FreedomBucket {
  startsAt: string; // ISO date for the start of week / month
  count: number;
  value: number;
  selfPermissions: number; // count where belowThreshold = true
}
export interface FreedomPro {
  weeks: FreedomBucket[]; // last 12 weeks, oldest first
  months: FreedomBucket[]; // last 12 months, oldest first
  // Permission vs effort split — pulled from steps, not events; both columns
  // count fully unlocked wishes only (so it's a real "how I get there" mirror).
  permissionStepsDone: number;
  effortStepsDone: number;
}

// PermissionEvent joined with its wish's display fields, so the client
// can show "what you allowed yourself" without an extra round-trip.
export interface EnrichedEvent {
  id: string;
  wishId: string | null;
  wishTitle: string | null;
  wishPrice: number | null;
  wishCurrency: string | null;
  value: number;
  domain: LifeDomain;
  belowThreshold: boolean;
  createdAt: string;
}
