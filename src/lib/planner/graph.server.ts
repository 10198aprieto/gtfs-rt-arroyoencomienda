// Índice de red combinada ArroyoBus (La Regional) + AUVASA para el planificador.
// Datos de AUVASA obtenidos del repositorio api-auvasa de VallaBus.
import abStops from "@/data/stops.json";
import abSchedule from "@/data/schedule.json";
import avStops from "@/data/auvasa/stops.json";
import avPatterns from "@/data/auvasa/patterns.json";
import avTrips from "@/data/auvasa/trips.json";

export type Net = "AB" | "AV";

export interface PlannerStop {
  key: string; // `${net}:${id}`
  net: Net;
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface PlannerPattern {
  net: Net;
  routeId: string;
  short: string;
  long: string;
  color: string;
  headsign: string;
  stops: string[]; // stop keys
  offsets: number[]; // segundos desde la salida
  trips: Array<{ service: string; start: number }>;
}

export interface ServiceInfo {
  days: boolean[]; // 0 = domingo
  start: string;
  end: string;
  dates?: string[];
  except?: string[];
}

interface Graph {
  stops: Map<string, PlannerStop>;
  stopList: PlannerStop[];
  patterns: PlannerPattern[];
  byStop: Map<string, Array<{ p: number; i: number }>>;
  services: Record<string, ServiceInfo>;
}

let cached: Graph | null = null;

export function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat));
  return 2 * R * Math.asin(Math.sqrt(s));
}

interface AbEntry {
  tripId: string;
  serviceId: string;
  routeId: string;
  routeShortName: string;
  routeColor: string;
  headsign: string;
  sec: number;
}

function buildGraph(): Graph {
  const stops = new Map<string, PlannerStop>();
  const patterns: PlannerPattern[] = [];
  const services: Record<string, ServiceInfo> = {};

  for (const s of abStops as Array<{ id: string; name: string; lat: number; lon: number }>) {
    const key = `AB:${s.id}`;
    stops.set(key, { key, net: "AB", id: String(s.id), name: s.name, lat: s.lat, lon: s.lon });
  }
  for (const s of avStops as Array<{ id: string; name: string; lat: number; lon: number }>) {
    const key = `AV:${s.id}`;
    stops.set(key, { key, net: "AV", id: String(s.id), name: s.name, lat: s.lat, lon: s.lon });
  }

  // ---- ArroyoBus: reconstruir viajes desde schedule.json (indexado por parada)
  const abData = abSchedule as unknown as {
    services: Record<string, { days: boolean[]; start: string; end: string }>;
    stops: Record<string, AbEntry[]>;
  };
  for (const [id, s] of Object.entries(abData.services)) services[`AB:${id}`] = { ...s };

  const abTrips = new Map<string, Array<AbEntry & { stopKey: string }>>();
  for (const [stopId, list] of Object.entries(abData.stops)) {
    const stopKey = `AB:${stopId}`;
    if (!stops.has(stopKey)) continue;
    for (const e of list) {
      let arr = abTrips.get(e.tripId);
      if (!arr) { arr = []; abTrips.set(e.tripId, arr); }
      arr.push({ ...e, stopKey });
    }
  }
  const abPatternIndex = new Map<string, number>();
  for (const list of abTrips.values()) {
    if (list.length < 2) continue;
    list.sort((a, b) => a.sec - b.sec);
    const first = list[0]!;
    const stopKeys = list.map((x) => x.stopKey);
    const pk = `${first.routeId}|${stopKeys.join(",")}`;
    let idx = abPatternIndex.get(pk);
    if (idx === undefined) {
      idx = patterns.length;
      abPatternIndex.set(pk, idx);
      patterns.push({
        net: "AB",
        routeId: first.routeId,
        short: first.routeShortName,
        long: "",
        color: first.routeColor || "0057B8",
        headsign: first.headsign,
        stops: stopKeys,
        offsets: list.map((x) => x.sec - first.sec),
        trips: [],
      });
    }
    patterns[idx]!.trips.push({ service: `AB:${first.serviceId}`, start: first.sec });
  }

  // ---- AUVASA
  const avPatternOffset = patterns.length;
  for (const p of avPatterns as Array<{
    routeId: string; short: string; long: string; color: string; headsign: string;
    stops: string[]; offsets: number[];
  }>) {
    patterns.push({
      net: "AV",
      routeId: p.routeId,
      short: p.short,
      long: p.long,
      color: p.color || "005CA9",
      headsign: p.headsign,
      stops: p.stops.map((s) => `AV:${s}`),
      offsets: p.offsets,
      trips: [],
    });
  }
  const av = avTrips as unknown as {
    services: Record<string, ServiceInfo>;
    trips: Array<{ p: number; s: string; t: number }>;
  };
  for (const [id, s] of Object.entries(av.services)) services[`AV:${id}`] = s;
  for (const t of av.trips) {
    const p = patterns[avPatternOffset + t.p];
    if (p) p.trips.push({ service: `AV:${t.s}`, start: t.t });
  }

  for (const p of patterns) p.trips.sort((a, b) => a.start - b.start);

  const byStop = new Map<string, Array<{ p: number; i: number }>>();
  patterns.forEach((p, pi) => {
    p.stops.forEach((sk, i) => {
      if (i === p.stops.length - 1) return; // no se puede subir en la última
      let arr = byStop.get(sk);
      if (!arr) { arr = []; byStop.set(sk, arr); }
      arr.push({ p: pi, i });
    });
  });

  return { stops, stopList: [...stops.values()], patterns, byStop, services };
}

export function getGraph(): Graph {
  if (!cached) cached = buildGraph();
  return cached;
}

export function nearbyStops(
  point: { lat: number; lon: number },
  radius = 900,
  limit = 8,
): Array<PlannerStop & { meters: number }> {
  const g = getGraph();
  return g.stopList
    .map((s) => ({ ...s, meters: haversine(point, s) }))
    .filter((s) => s.meters <= radius)
    .sort((a, b) => a.meters - b.meters)
    .slice(0, limit);
}

export function madridNow(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(d);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  const wd: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const hour = m.hour === "24" ? 0 : Number(m.hour);
  const sec = hour * 3600 + Number(m.minute) * 60 + Number(m.second);
  return {
    weekday: wd[m.weekday ?? "Sun"] ?? 0,
    date: `${m.year}${m.month}${m.day}`,
    sec,
    epochMidnight: Math.floor(d.getTime() / 1000) - sec,
  };
}

export function activeServices(date: string, weekday: number): Set<string> {
  const g = getGraph();
  const out = new Set<string>();
  for (const [id, s] of Object.entries(g.services)) {
    if (s.except?.includes(date)) continue;
    if (s.dates?.includes(date)) { out.add(id); continue; }
    if (s.days[weekday] && s.start && s.end && date >= s.start && date <= s.end) out.add(id);
  }
  return out;
}
