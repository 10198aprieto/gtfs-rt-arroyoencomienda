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

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearestStops(lat: number, lon: number, limit = 5): Array<StopInfo & { meters: number }> {
  return STOPS
    .map((s) => ({ ...s, meters: haversineMeters(lat, lon, s.lat, s.lon) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, limit);
}

export type { StopInfo };