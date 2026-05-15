import stopsData from "@/data/stops.json";

interface StopInfo { id: string; name: string; desc?: string; lat: number; lon: number }
const STOPS = stopsData as StopInfo[];

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function findStop(query: string): StopInfo | null {
  const q = query.trim();
  if (!q) return null;
  // Por id exacto
  const byId = STOPS.find((s) => s.id === q);
  if (byId) return byId;
  // Por nombre (substring normalizado)
  const nq = normalize(q);
  return STOPS.find((s) => normalize(s.name).includes(nq)) ?? null;
}

export function searchStops(query: string, limit = 8): StopInfo[] {
  const nq = normalize(query.trim());
  if (!nq) return [];
  return STOPS.filter((s) => normalize(s.name).includes(nq)).slice(0, limit);
}

export function getStopById(id: string): StopInfo | null {
  return STOPS.find((s) => s.id === id) ?? null;
}