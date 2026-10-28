const buckets = new Map<string, number[]>();
const recent = new Map<string, number>();

export function allowRequest(ip: string, limit = 10, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const stamps = (buckets.get(ip) || []).filter((stamp) => now - stamp < windowMs);
  if (stamps.length >= limit) {
    buckets.set(ip, stamps);
    return false;
  }
  stamps.push(now);
  buckets.set(ip, stamps);
  return true;
}

/** When store is false, returns true if this enquiry was already accepted. When store is true, records it. */
export function rememberSubmission(key: string, store: boolean) {
  const now = Date.now();
  for (const [saved, at] of recent) {
    if (now - at > 10 * 60 * 1000) recent.delete(saved);
  }
  if (!store) return recent.has(key);
  recent.set(key, now);
  return false;
}
