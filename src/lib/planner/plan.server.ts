// Búsqueda de itinerarios (directo o con un transbordo) en la red ArroyoBus + AUVASA.
import {
  getGraph, nearbyStops, haversine, madridNow, activeServices,
  type PlannerStop, type Net,
} from "./graph.server";
import { fetchStopArrivals } from "@/lib/gtfsrt/fetch-arrivals";

const WALK_SPEED = 1.25; // m/s (~4,5 km/h)
const MAX_WALK = 900;
const TRANSFER_WALK = 350;
const MIN_TRANSFER = 120; // segundos de margen para enlazar

export interface WalkLeg {
  kind: "walk";
  meters: number;
  seconds: number;
  toName: string;
}
export interface BusLeg {
  kind: "bus";
  net: Net;
  routeId: string;
  routeShort: string;
  routeLong: string;
  color: string;
  headsign: string;
  from: { id: string; name: string; lat: number; lon: number };
  to: { id: string; name: string; lat: number; lon: number };
  depart: number; // epoch s
  arrive: number; // epoch s
  stopsCount: number;
  live: boolean;
}
export type Leg = WalkLeg | BusLeg;

export interface TripOption {
  id: string;
  depart: number;
  arrive: number;
  totalMinutes: number;
  legs: Leg[];
  usesAuvasa: boolean;
}

export interface PlanResult {
  options: TripOption[];
  origin: { lat: number; lon: number; label: string };
  destination: { lat: number; lon: number; label: string };
  fallbackStop?: { id: string; name: string; meters: number };
}

interface Ctx {
  active: Set<string>;
  nowSec: number;
  midnight: number;
}

/** Primera salida de un patrón en esa parada a partir de `afterSec` (segundos desde medianoche). */
function nextDeparture(patternIdx: number, i: number, afterSec: number, ctx: Ctx): number | null {
  const p = getGraph().patterns[patternIdx];
  if (!p) return null;
  const off = p.offsets[i] ?? 0;
  for (const t of p.trips) {
    const dep = t.start + off;
    if (dep < afterSec) continue;
    if (!ctx.active.has(t.service)) continue;
    return dep;
  }
  return null;
}

function walkLeg(meters: number, toName: string): WalkLeg {
  return { kind: "walk", meters: Math.round(meters), seconds: Math.round(meters / WALK_SPEED), toName };
}

function busLeg(
  patternIdx: number, i: number, j: number, depSec: number, ctx: Ctx,
): BusLeg | null {
  const g = getGraph();
  const p = g.patterns[patternIdx];
  if (!p) return null;
  const from = g.stops.get(p.stops[i]!);
  const to = g.stops.get(p.stops[j]!);
  if (!from || !to) return null;
  const ride = (p.offsets[j] ?? 0) - (p.offsets[i] ?? 0);
  return {
    kind: "bus",
    net: p.net,
    routeId: p.routeId,
    routeShort: p.short,
    routeLong: p.long,
    color: p.color,
    headsign: p.headsign,
    from: { id: from.id, name: from.name, lat: from.lat, lon: from.lon },
    to: { id: to.id, name: to.name, lat: to.lat, lon: to.lon },
    depart: ctx.midnight + depSec,
    arrive: ctx.midnight + depSec + Math.max(60, ride),
    stopsCount: j - i,
    live: false,
  };
}

export async function planTrip(
  origin: { lat: number; lon: number; label: string },
  destination: { lat: number; lon: number; label: string },
): Promise<PlanResult> {
  const g = getGraph();
  const { weekday, date, sec, epochMidnight } = madridNow();
  const ctx: Ctx = { active: activeServices(date, weekday), nowSec: sec, midnight: epochMidnight };

  const origins = nearbyStops(origin, MAX_WALK, 10);
  const dests = nearbyStops(destination, MAX_WALK, 10);
  const destMeters = new Map(dests.map((d) => [d.key, d.meters]));

  const options: TripOption[] = [];

  // ---------- Directos ----------
  for (const o of origins) {
    const walk1 = o.meters / WALK_SPEED;
    for (const { p: pi, i } of g.byStop.get(o.key) ?? []) {
      const pat = g.patterns[pi]!;
      let bestJ = -1;
      let bestWalk = Infinity;
      for (let j = i + 1; j < pat.stops.length; j++) {
        const m = destMeters.get(pat.stops[j]!);
        if (m !== undefined && m < bestWalk) { bestWalk = m; bestJ = j; }
      }
      if (bestJ < 0) continue;
      const dep = nextDeparture(pi, i, sec + walk1, ctx);
      if (dep === null) continue;
      const leg = busLeg(pi, i, bestJ, dep, ctx);
      if (!leg) continue;
      const walk2 = walkLeg(bestWalk, destination.label);
      options.push({
        id: `d-${pi}-${i}-${bestJ}`,
        depart: ctx.midnight + sec,
        arrive: leg.arrive + walk2.seconds,
        totalMinutes: 0,
        legs: [walkLeg(o.meters, `${o.name}${o.net === "AB" ? ` (parada ${o.id})` : ""}`), leg, walk2],
        usesAuvasa: pat.net === "AV",
      });
    }
  }

  // ---------- Con un transbordo ----------
  if (options.length < 3) {
    // Segundas piernas: patrones que alcanzan alguna parada de destino
    interface SecondLeg { p: number; i: number; j: number; walk: number }
    const boarding = new Map<string, SecondLeg[]>();
    for (const d of dests) {
      for (let pi = 0; pi < g.patterns.length; pi++) {
        const pat = g.patterns[pi]!;
        const j = pat.stops.indexOf(d.key);
        if (j <= 0) continue;
        for (let i2 = 0; i2 < j; i2++) {
          const key = pat.stops[i2]!;
          let arr = boarding.get(key);
          if (!arr) { arr = []; boarding.set(key, arr); }
          arr.push({ p: pi, i: i2, j, walk: d.meters });
        }
      }
    }
    const boardingStops = [...boarding.keys()]
      .map((k) => g.stops.get(k))
      .filter((s): s is PlannerStop => !!s);

    for (const o of origins) {
      const walk1 = o.meters / WALK_SPEED;
      for (const { p: pi, i } of g.byStop.get(o.key) ?? []) {
        const pat = g.patterns[pi]!;
        const dep1 = nextDeparture(pi, i, sec + walk1, ctx);
        if (dep1 === null) continue;
        for (let k = i + 1; k < pat.stops.length; k++) {
          const mid = g.stops.get(pat.stops[k]!);
          if (!mid) continue;
          const arr1 = dep1 + ((pat.offsets[k] ?? 0) - (pat.offsets[i] ?? 0));
          for (const b of boardingStops) {
            const tw = b.key === mid.key ? 0 : haversine(mid, b);
            if (tw > TRANSFER_WALK) continue;
            for (const sl of boarding.get(b.key) ?? []) {
              const p2 = g.patterns[sl.p]!;
              if (p2.routeId === pat.routeId && p2.net === pat.net) continue;
              const ready = arr1 + tw / WALK_SPEED + MIN_TRANSFER;
              const dep2 = nextDeparture(sl.p, sl.i, ready, ctx);
              if (dep2 === null || dep2 - arr1 > 45 * 60) continue;
              const leg1 = busLeg(pi, i, k, dep1, ctx);
              const leg2 = busLeg(sl.p, sl.i, sl.j, dep2, ctx);
              if (!leg1 || !leg2) continue;
              const walkEnd = walkLeg(sl.walk, destination.label);
              const legs: Leg[] = [
                walkLeg(o.meters, `${o.name}${o.net === "AB" ? ` (parada ${o.id})` : ""}`),
                leg1,
              ];
              if (tw > 20) legs.push(walkLeg(tw, b.name));
              legs.push(leg2, walkEnd);
              options.push({
                id: `t-${pi}-${i}-${k}-${sl.p}-${sl.i}-${sl.j}`,
                depart: ctx.midnight + sec,
                arrive: leg2.arrive + walkEnd.seconds,
                totalMinutes: 0,
                legs,
                usesAuvasa: pat.net === "AV" || p2.net === "AV",
              });
            }
          }
        }
      }
    }
  }

  // ---------- Selección ----------
  options.sort((a, b) => a.arrive - b.arrive);
  const seen = new Set<string>();
  const best: TripOption[] = [];
  for (const opt of options) {
    const sig = opt.legs
      .filter((l): l is BusLeg => l.kind === "bus")
      .map((l) => `${l.net}${l.routeShort}${l.from.id}`)
      .join(">");
    if (seen.has(sig)) continue;
    seen.add(sig);
    opt.totalMinutes = Math.max(1, Math.round((opt.arrive - opt.depart) / 60));
    best.push(opt);
    if (best.length >= 3) break;
  }

  // ---------- Tiempo real en la primera pierna de ArroyoBus ----------
  await Promise.all(
    best.map(async (opt) => {
      const first = opt.legs.find((l): l is BusLeg => l.kind === "bus");
      if (!first || first.net !== "AB") return;
      try {
        const live = await fetchStopArrivals(first.from.id);
        const match = live
          .filter((a) => a.routeId === first.routeId)
          .map((a) => a.estimatedArrival)
          .filter((t) => Math.abs(t - first.depart) < 20 * 60)
          .sort((a, b) => Math.abs(a - first.depart) - Math.abs(b - first.depart))[0];
        if (match) {
          const shift = match - first.depart;
          first.depart = match;
          first.arrive += shift;
          first.live = true;
          opt.arrive += shift;
          opt.totalMinutes = Math.max(1, Math.round((opt.arrive - opt.depart) / 60));
        }
      } catch {
        /* sin datos en vivo */
      }
    }),
  );
  best.sort((a, b) => a.arrive - b.arrive);

  const nearestToDest = dests[0] ?? nearbyStops(destination, 5000, 1)[0];

  return {
    options: best,
    origin,
    destination,
    fallbackStop: best.length
      ? undefined
      : nearestToDest
        ? { id: nearestToDest.id, name: nearestToDest.name, meters: Math.round(nearestToDest.meters) }
        : undefined,
  };
}

/** Geocodificación con Nominatim (OpenStreetMap) limitada al área de Valladolid. */
const geoCache = new Map<string, { lat: number; lon: number; label: string; at: number }>();

export async function geocode(text: string): Promise<{ lat: number; lon: number; label: string } | null> {
  const q = text.trim();
  if (!q) return null;
  const hit = geoCache.get(q.toLowerCase());
  if (hit && Date.now() - hit.at < 10 * 60_000) return { lat: hit.lat, lon: hit.lon, label: hit.label };
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=es" +
    "&viewbox=-5.05,41.78,-4.55,41.50&bounded=1&q=" + encodeURIComponent(q);
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "ArroyoBus/1.0 (https://arroyobus.net)" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string; name?: string; display_name?: string }>;
  const first = data[0];
  if (!first) return null;
  const label = first.name || String(first.display_name || q).split(",")[0]!.trim();
  const out = { lat: parseFloat(first.lat), lon: parseFloat(first.lon), label };
  geoCache.set(q.toLowerCase(), { ...out, at: Date.now() });
  return out;
}
