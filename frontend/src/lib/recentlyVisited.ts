const STORAGE_KEY = "rentzy_recently_visited";
const MAX_ITEMS = 20;
export const RECENTLY_VISITED_EVENT = "rentzy-recently-visited-updated";

export interface RecentlyVisitedEntry {
  id: string;
  visitedAt: number;
}

function readEntries(): RecentlyVisitedEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (entry): entry is RecentlyVisitedEntry =>
        typeof entry?.id === "string" && typeof entry?.visitedAt === "number"
    );
  } catch {
    return [];
  }
}

function writeEntries(entries: RecentlyVisitedEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(RECENTLY_VISITED_EVENT));
}

export function getRecentlyVisitedIds(limit = MAX_ITEMS): string[] {
  return readEntries()
    .sort((a, b) => b.visitedAt - a.visitedAt)
    .slice(0, limit)
    .map((entry) => entry.id);
}

export function addRecentlyVisited(itemId: string) {
  const now = Date.now();
  const entries = readEntries().filter((entry) => entry.id !== itemId);
  entries.unshift({ id: itemId, visitedAt: now });
  writeEntries(entries.slice(0, MAX_ITEMS));
}

export function removeRecentlyVisited(itemId: string) {
  const entries = readEntries().filter((entry) => entry.id !== itemId);
  writeEntries(entries);
}
