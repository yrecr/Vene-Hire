// ponytail: in-memory per-IP limiter — no Redis/Upstash account needed.
// Ceiling: resets whenever the serverless instance recycles, and each Vercel
// lambda has its own memory, so a determined attacker spread across many
// invocations isn't actually capped. Good enough to stop casual form spam;
// upgrade to Upstash (or similar) if real abuse shows up.
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0].trim() || 'unknown';
}
