import { randomBytes } from 'node:crypto';

// In-memory share tokens. Each token is a one-way pointer to a wish, used to
// make the share card image URL public without exposing the wish id directly.
// Tokens are immutable and revocable only by restart (MVP).
interface TokenRef {
  wishId: string;
  userId: number;
  createdAt: number;
}

const tokens = new Map<string, TokenRef>();

export async function createShareToken(wishId: string, userId: number): Promise<string> {
  const token = randomBytes(12).toString('base64url');
  tokens.set(token, { wishId, userId, createdAt: Date.now() });
  return token;
}

export async function lookupShareToken(token: string): Promise<TokenRef | null> {
  return tokens.get(token) ?? null;
}
