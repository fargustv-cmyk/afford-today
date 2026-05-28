// Hard-reset every piece of user-owned state EXCEPT Pro entitlements.
// Triggered from the bot's /reset command after explicit confirmation.
//
// Preserved: paid_users (Pro), hand-granted Pro via PRO_USER_IDS env.
// Wiped:     wishes, steps, events, check-ins, wishlists, user step
//            templates, share tokens, persisted user settings, in-memory
//            user record (it'll be re-created on next /api/me).

import { wipeWishesForUser } from '../db/wishes.js';
import { wipeStepsForUser } from '../db/steps.js';
import { wipeEventsForUser } from '../db/permissionEvents.js';
import { wipeCheckInsByWishIds } from '../db/checkIns.js';
import { wipeWishlistsForUser } from '../db/wishlists.js';
import { wipeUserTemplatesForUser } from '../db/userTemplates.js';
import { wipeShareTokensForUser } from '../db/shareTokens.js';
import { wipeSettings } from './userSettingsStore.js';
import { dropUserFromMemory } from '../db/users.js';

export async function wipeUser(userId: number): Promise<void> {
  // Wishes first — we need their ids to drop matching check-ins.
  const wishIds = await wipeWishesForUser(userId);
  await Promise.all([
    wipeStepsForUser(userId),
    wipeEventsForUser(userId),
    wipeCheckInsByWishIds(wishIds),
    wipeWishlistsForUser(userId),
    wipeUserTemplatesForUser(userId),
    wipeShareTokensForUser(userId),
    wipeSettings(userId)
  ]);
  dropUserFromMemory(userId);
  console.log(`[wipe] cleared user ${userId} (Pro preserved)`);
}
