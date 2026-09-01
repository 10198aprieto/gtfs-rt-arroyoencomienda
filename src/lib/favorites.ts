// Favoritos y hábitos locales (sin servidor, sin cuentas).
const FAV_KEY = "arroyobus.places.v1";
const HABIT_KEY = "arroyobus.habits.v1";

export interface FavoritePlace {
  stopId: string;
  label: string;
  emoji: string;
}

export interface HabitEntry {
  stopId: string;
  hits: number;
  hours: number[]; // horas del día en las que se consultó
  last: number;
}

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("arroyobus:favorites"));
  } catch {
    /* ignore */
  }
}

export function loadPlaces(): FavoritePlace[] {
  return read<FavoritePlace[]>(FAV_KEY, []);
}

export function savePlaces(places: FavoritePlace[]) {
  write(FAV_KEY, places.slice(0, 8));
}

export function togglePlace(place: FavoritePlace) {
  const list = loadPlaces();
  const idx = list.findIndex((p) => p.stopId === place.stopId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(place);
  savePlaces(list);
  return list;
}

export function isFavorite(stopId: string) {
  return loadPlaces().some((p) => p.stopId === stopId);
}

export function loadHabits(): HabitEntry[] {
  return read<HabitEntry[]>(HABIT_KEY, []);
}

export function trackStopVisit(stopId: string) {
  if (!isBrowser()) return;
  const list = loadHabits();
  const hour = new Date().getHours();
  const found = list.find((h) => h.stopId === stopId);
  if (found) {
    found.hits += 1;
    found.hours.push(hour);
    found.hours = found.hours.slice(-40);
    found.last = Date.now();
  } else {
    list.push({ stopId, hits: 1, hours: [hour], last: Date.now() });
  }
  write(HABIT_KEY, list.slice(-30));
}

/** Parada más probable para la hora actual, según el histórico local. */
export function suggestedStop(now = new Date()): string | null {
  const hour = now.getHours();
  const list = loadHabits();
  if (!list.length) return null;
  let best: { stopId: string; score: number } | null = null;
  for (const h of list) {
    const near = h.hours.filter((x) => Math.abs(x - hour) <= 1).length;
    const score = near * 3 + h.hits;
    if (near === 0 && h.hits < 3) continue;
    if (!best || score > best.score) best = { stopId: h.stopId, score };
  }
  return best?.stopId ?? null;
}

export function lastStop(): string | null {
  const list = loadHabits().sort((a, b) => b.last - a.last);
  return list[0]?.stopId ?? null;
}
