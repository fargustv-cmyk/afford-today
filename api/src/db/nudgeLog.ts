// Frequency cap for daily nudges. SPEC §6 — light, optional, no spam.

const lastNudgeAt = new Map<number, number>();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function wasNudgedRecently(userId: number): Promise<boolean> {
  const ts = lastNudgeAt.get(userId);
  if (!ts) return false;
  return Date.now() - ts < ONE_DAY_MS;
}

export async function markNudged(userId: number): Promise<void> {
  lastNudgeAt.set(userId, Date.now());
}
