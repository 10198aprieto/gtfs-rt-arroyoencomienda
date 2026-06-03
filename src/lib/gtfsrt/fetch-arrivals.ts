import stopsData from "@/data/stops.json";

export interface ArrivalData {
  tripId: string;
  vehicleId: string;
  routeId: string;
  routeName: string;
  stopId: string;
  stopName: string;
  estimatedArrival: number; // unix timestamp seconds
  lat: number;
  lon: number;
  speed?: number;
  bearing?: number;
  directionId?: string;
  tripHeadsign?: string;
  routeShortName?: string;
  routeColor?: string;
  isEstimated?: boolean;
}

export interface VehiclePosition {
  vehicleId: string;
  vehicleName?: string;
  routeId: string;
  lat: number;
  lon: number;
  speed?: number;
  bearing?: number;
  timestamp?: number;
}

const UPSTREAM_VP = "https://enzeyiwpoomhlxmcjivn.supabase.co/functions/v1/gtfs-rt?format=json";
const UPSTREAM_TU = "https://enzeyiwpoomhlxmcjivn.supabase.co/functions/v1/gtfs-rt-trip-updates?format=json";

const STOPS_MAP = new Map<string, { name: string }>(
  (stopsData as Array<{ id: string; name: string }>).map((s) => [String(s.id), { name: s.name }])
);

function routeMeta(routeId: string): { shortName: string; color: string; name: string } {
  switch (routeId) {
    case "Roja": return { shortName: "R", color: "ca0d32", name: "Línea Roja" };
    case "Azul": return { shortName: "A", color: "3b4cd1", name: "Línea Azul" };
    case "Verde": return { shortName: "V", color: "2ea846", name: "Línea Verde" };
    default: return { shortName: routeId, color: "888888", name: routeId };
  }
}

async function fetchJson(url: string, timeoutMs = 8000): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      console.error(`[gtfs-rt] ${url} status=${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`[gtfs-rt] ${url} error:`, (e as Error).message);
    return null;
  }
}

// ---------- Vehicle positions ----------

let cachedVehicles: VehiclePosition[] | null = null;
let cachedVehiclesAt = 0;
const VEHICLES_TTL_MS = 8_000;
let vehiclesInflight: Promise<VehiclePosition[]> | null = null;

export async function fetchAllVehiclePositions(): Promise<VehiclePosition[]> {
  const now = Date.now();
  if (cachedVehicles && now - cachedVehiclesAt < VEHICLES_TTL_MS) return cachedVehicles;
  if (vehiclesInflight) return vehiclesInflight;
  vehiclesInflight = (async () => {
    try {
      const json = await fetchJson(UPSTREAM_VP);
      const entities: any[] = Array.isArray(json?.entity) ? json.entity : [];
      const list: VehiclePosition[] = [];
      for (const e of entities) {
        const v = e?.vehicle;
        const pos = v?.position;
        if (!v || !pos) continue;
        list.push({
          vehicleId: String(v?.vehicle?.id ?? e?.id ?? ""),
          vehicleName: v?.vehicle?.label ? String(v.vehicle.label) : undefined,
          routeId: String(v?.trip?.route_id ?? v?.trip?.routeId ?? ""),
          lat: Number(pos.latitude),
          lon: Number(pos.longitude),
          speed: typeof pos.speed === "number" ? pos.speed : undefined,
          bearing: typeof pos.bearing === "number" ? pos.bearing : undefined,
          timestamp: typeof v.timestamp === "number" ? v.timestamp : undefined,
        });
      }
      cachedVehicles = list;
      cachedVehiclesAt = Date.now();
      return list;
    } finally {
      vehiclesInflight = null;
    }
  })();
  return vehiclesInflight;
}

// ---------- Trip updates → ArrivalData ----------

let cachedArrivals: ArrivalData[] | null = null;
let cachedArrivalsAt = 0;
const ARRIVALS_TTL_MS = 8_000;
const ARRIVALS_STALE_MS = 120_000;
let arrivalsInflight: Promise<ArrivalData[]> | null = null;

export async function fetchAllArrivals(): Promise<ArrivalData[]> {
  const now = Date.now();
  if (cachedArrivals && now - cachedArrivalsAt < ARRIVALS_TTL_MS) return cachedArrivals;
  if (arrivalsInflight) return arrivalsInflight;

  arrivalsInflight = (async () => {
    try {
      const [tuJson, vehicles] = await Promise.all([
        fetchJson(UPSTREAM_TU),
        fetchAllVehiclePositions(),
      ]);
      const vMap = new Map(vehicles.map((v) => [v.vehicleId, v]));
      const entities: any[] = Array.isArray(tuJson?.entity) ? tuJson.entity : [];
      const out: ArrivalData[] = [];

      for (const e of entities) {
        const tu = e?.trip_update ?? e?.tripUpdate;
        if (!tu) continue;
        const trip = tu.trip ?? {};
        const tripId = String(trip.trip_id ?? trip.tripId ?? e.id ?? "");
        const routeId = String(trip.route_id ?? trip.routeId ?? "");
        const directionId = trip.direction_id != null ? String(trip.direction_id) : undefined;
        const vehicleId = String(tu.vehicle?.id ?? "");
        const meta = routeMeta(routeId);
        const veh = vMap.get(vehicleId);

        const updates: any[] = Array.isArray(tu.stop_time_update ?? tu.stopTimeUpdate)
          ? (tu.stop_time_update ?? tu.stopTimeUpdate)
          : [];

        for (const u of updates) {
          const stopId = String(u.stop_id ?? u.stopId ?? "");
          if (!stopId) continue;
          const t = u.arrival?.time ?? u.departure?.time;
          if (typeof t !== "number") continue;

          out.push({
            tripId,
            vehicleId,
            routeId,
            routeName: meta.name,
            routeShortName: meta.shortName,
            routeColor: meta.color,
            stopId,
            stopName: STOPS_MAP.get(stopId)?.name ?? "",
            estimatedArrival: t,
            lat: veh?.lat ?? 0,
            lon: veh?.lon ?? 0,
            speed: veh?.speed,
            bearing: veh?.bearing,
            directionId,
            tripHeadsign: undefined,
            isEstimated: false,
          });
        }
      }

      cachedArrivals = out;
      cachedArrivalsAt = Date.now();
      return out;
    } catch (e) {
      console.error("[gtfs-rt] fetchAllArrivals error:", (e as Error).message);
      if (cachedArrivals && Date.now() - cachedArrivalsAt < ARRIVALS_STALE_MS) {
        return cachedArrivals;
      }
      return [];
    } finally {
      arrivalsInflight = null;
    }
  })();

  return arrivalsInflight;
}

export async function fetchStopArrivals(stopId: string): Promise<ArrivalData[]> {
  const all = await fetchAllArrivals();
  const sid = String(stopId);
  return all.filter((a) => a.stopId === sid);
}
