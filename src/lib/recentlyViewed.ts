const KEY = "am:recently-viewed";
const MAX = 6;

/** Record a vehicle-detail visit (most recent first, deduped). Safe under SSR/private mode. */
export function recordRecentlyViewed(id: string) {
  if (typeof window === "undefined") return;
  try {
    const prev = getRecentlyViewed().filter((x) => x !== id);
    localStorage.setItem(KEY, JSON.stringify([id, ...prev].slice(0, MAX)));
  } catch {
    // storage unavailable (private mode / quota) — recently-viewed is best-effort
  }
}

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
