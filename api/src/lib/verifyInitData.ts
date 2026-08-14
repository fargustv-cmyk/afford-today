import crypto from 'node:crypto';

export interface TgUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

/**
 * Verify Telegram Mini App `initData` per official spec.
 *   1. Pull `hash`, sort the rest by key, build `data_check_string`.
 *   2. secret_key = HMAC_SHA256("WebAppData", BOT_TOKEN)
 *   3. expected_hash = HMAC_SHA256(secret_key, data_check_string)
 *   4. Compare hex; if match → trust the `user` field.
 *
 * Returns `null` on any failure. Never throws to callers.
 */
export function verifyInitData(initData: string, botToken: string): TgUser | null {
  if (!botToken || !initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  // Constant-time compare to avoid leaking timing info on the hash
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  // Telegram initData is a credential, so reject captured payloads that are
  // replayed long after Telegram issued them.
  const authDate = Number(params.get('auth_date'));
  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxAgeSeconds = 24 * 60 * 60;
  if (
    !Number.isFinite(authDate) ||
    authDate <= 0 ||
    authDate > nowSeconds + 5 * 60 ||
    nowSeconds - authDate > maxAgeSeconds
  ) {
    return null;
  }

  const userRaw = params.get('user');
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw) as TgUser;
  } catch {
    return null;
  }
}
