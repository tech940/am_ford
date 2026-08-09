/**
 * Saved-cars "garage" and price-watch lists, persisted in localStorage.
 * Components listen for the change event so hearts/badges stay in sync everywhere.
 */
const SAVED_KEY = "am:garage";
const WATCH_KEY = "am:price-watch";
export const GARAGE_EVENT = "am:garage-change";

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids.slice(0, 20)));
    window.dispatchEvent(new CustomEvent(GARAGE_EVENT));
  } catch {
    /* storage unavailable — feature is best-effort */
  }
}

export const getSavedVehicles = () => readList(SAVED_KEY);
export const isSaved = (id: string) => readList(SAVED_KEY).includes(id);

export function toggleSaved(id: string): boolean {
  const list = readList(SAVED_KEY);
  const next = list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];
  writeList(SAVED_KEY, next);
  return next.includes(id);
}

export const getWatchedVehicles = () => readList(WATCH_KEY);
export const isWatched = (id: string) => readList(WATCH_KEY).includes(id);

export function watchVehicle(id: string) {
  const list = readList(WATCH_KEY);
  if (!list.includes(id)) writeList(WATCH_KEY, [id, ...list]);
}
