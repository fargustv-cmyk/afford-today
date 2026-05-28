// In-memory user store. Stub for prompt 1 — replaced with Postgres + Drizzle
// in the next iteration once the DB is provisioned on Render.
//
// Contract is intentionally narrow so the swap is a one-file change.

import type { User, UserSettings } from '@afford/shared';
import type { TgUser } from '../lib/verifyInitData.js';
import { readSettings, writeSettings } from '../lib/userSettingsStore.js';

const users = new Map<number, User>();

export async function upsertUserFromTelegram(tg: TgUser, locale = 'ru'): Promise<User> {
  // Always pull persisted settings from Redis so themes/lens survive
  // server restarts. In-memory cache inside userSettingsStore keeps this cheap.
  const settings = await readSettings(tg.id);
  const existing = users.get(tg.id);
  if (existing) {
    existing.settings = settings;
    existing.firstName = tg.first_name;
    return existing;
  }
  const fresh: User = {
    id: tg.id,
    createdAt: new Date().toISOString(),
    currency: 'RUB',
    locale: tg.language_code === 'en' ? 'en' : locale,
    subscriptionStatus: 'free',
    subscriptionUntil: null,
    giftedTokens: 0,
    selfPermissionFactor: 1,
    settings,
    firstName: tg.first_name
  };
  users.set(tg.id, fresh);
  return fresh;
}

export async function getUser(id: number): Promise<User | null> {
  return users.get(id) ?? null;
}

export async function listAllUsers(): Promise<User[]> {
  return Array.from(users.values());
}

export async function updateUserSettings(
  userId: number,
  patch: Partial<UserSettings>
): Promise<User | null> {
  const u = users.get(userId);
  if (!u) return null;
  u.settings = { ...u.settings, ...patch };
  await writeSettings(userId, u.settings);
  return u;
}

export function dropUserFromMemory(userId: number): void {
  users.delete(userId);
}
