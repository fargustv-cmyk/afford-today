import { randomBytes } from 'node:crypto';
import { hashGetAll, hashSet } from '../lib/hashStore.js';

// Persisted share tokens. Each token is an unguessable (96-bit random) pointer
// to a wish; making the share card image URL public without exposing the wish
// id directly. Stored in Redis so a Telegram unfurl still works after the
// server restarts.
interface TokenRef {
  wishId: string;
  userId: number;
  createdAt: number;
}

const REDIS_KEY = 'afford:shareTokens';
const tokens = new Map<string, TokenRef>();

export async function loadShareTokensFromRedis(): Promise<void> {
  const map = await hashGetAll<TokenRef>(REDIS_KEY);
  for (const [k, v] of Object.entries(map)) tokens.set(k, v);
  console.log(`[shareTokens] loaded ${tokens.size} token(s) from redis`);
}

export async function createShareToken(wishId: string, userId: number): Promise<string> {
  const token = randomBytes(12).toString('base64url');
  const ref: TokenRef = { wishId, userId, createdAt: Date.now() };
  tokens.set(token, ref);
  hashSet(REDIS_KEY, token, JSON.stringify(ref));
  return token;
}

export async function lookupShareToken(token: string): Promise<TokenRef | null> {
  return tokens.get(token) ?? null;
}
