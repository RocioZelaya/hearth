import { db } from "./db";

type Rule = { max: number; windowMs: number };

/** How often one visitor may do each thing. */
export const RATE_LIMITS = {
  createNote: { max: 3, windowMs: 10 * 60_000 },
  reportNote: { max: 20, windowMs: 10 * 60_000 },
} satisfies Record<string, Rule>;

export type RateLimitedAction = keyof typeof RATE_LIMITS;

const LONGEST_WINDOW_MS = Math.max(...Object.values(RATE_LIMITS).map((r) => r.windowMs));

/**
 * Sliding-window limiter backed by SQLite, so it survives restarts and
 * works across several server processes. Returns whether the action is
 * allowed; when it is, the hit is recorded.
 *
 * Count and insert are not atomic: two requests racing at `max - 1` can
 * both pass. That is acceptable for this limiter's purpose (slowing abuse,
 * not billing).
 */
export async function consumeRateLimit(ipHash: string, action: RateLimitedAction): Promise<boolean> {
  const { max, windowMs } = RATE_LIMITS[action];
  const now = Date.now();

  const recent = await db.rateLimitHit.count({
    where: { ipHash, action, createdAt: { gte: new Date(now - windowMs) } },
  });
  if (recent >= max) return false;

  await db.rateLimitHit.create({ data: { ipHash, action } });

  // Keep the table small: drop hits that no window can still count.
  await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(now - LONGEST_WINDOW_MS) } } });
  return true;
}
