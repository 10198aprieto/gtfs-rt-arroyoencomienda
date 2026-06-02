import { STOP_IDS } from "./stops";

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

const BASE_URL = "https://arroyo.actiosae.com/bff/mobile/arrivals";
const VEHICLE_URL = "https://arroyo.actiosae.com/bff/mobile/vehiclePosition";
const ROUTE_IDS = ["Roja", "Azul"] as const;
const FEED_ID = "arroyo";
const ANDROID_PACKAGE = "com.geoactio.arroyo_encomienda";
const ANDROID_CERT = "222E5B204DE7B52F04DBED2A8B7947D566B0C2CA";
const DEFAULT_API_KEY = "AIzaSyCvtaF21g0lPX0cTgOiIcHZNZRQlw2TRVA";

function getApiKey(): string {
  return process.env.ACTIOSAE_API_KEY || DEFAULT_API_KEY;
}

function commonHeaders() {
  return {
    "Accept": "application/json",
    "User-Agent": "ArroyoBus-GTFSRT/1.0",
    "X-Android-Package": ANDROID_PACKAGE,
    "X-Android-Cert": ANDROID_CERT,
  } as Record<string, string>;
}

export async function fetchStopArrivals(stopId: string): Promise<ArrivalData[]> {
  try {
    const apiKey = getApiKey();
    const url = `${BASE_URL}/${stopId}?feedId=${FEED_ID}${apiKey ? `&key=${apiKey}` : ""}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: commonHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[actiosae] stop=${stopId} status=${res.status} body=${body.slice(0, 200)}`);
      return [];
    }
    const json = await res.json() as any[];

    if (!Array.isArray(json)) return [];

    const arrivals: ArrivalData[] = [];

    for (const item of json) {
      if (item.tripId && item.vehicleId) {
        arrivals.push({
          tripId: String(item.tripId),
          vehicleId: String(item.vehicleId),
          routeId: String(item.route?.routeId || ""),
          routeName: String(item.route?.routeName || ""),
          routeShortName: item.route?.routeShortName,
          routeColor: item.route?.color,
          stopId: String(item.stopId || stopId),
          stopName: String(item.stopName || ""),
          estimatedArrival: item.arrivalTime
            ? Math.floor(new Date(item.arrivalTime).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          lat: item.lat ?? 0,
          lon: item.lon ?? 0,
          speed: item.speed,
          bearing: item.bearing,
          directionId: item.directionId,
          tripHeadsign: item.tripHeadsign,
          isEstimated: item.isEstimated,
        });
      }
    }
    return arrivals;
  } catch (e) {
    console.error(`[actiosae] stop=${stopId} fetch error:`, (e as Error)?.message);
    return [];
  }
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

async function fetchVehiclesForRoute(routeId: string): Promise<VehiclePosition[]> {
  try {
    const apiKey = getApiKey();
    const url = `${VEHICLE_URL}?feedId=${FEED_ID}&routeId=${encodeURIComponent(routeId)}${apiKey ? `&key=${apiKey}` : ""}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { headers: commonHeaders(), signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[actiosae] vehiclePosition route=${routeId} status=${res.status} body=${body.slice(0, 200)}`);
      return [];
    }
    const json = await res.json() as { gpsPositions?: any[] };
    const list = Array.isArray(json?.gpsPositions) ? json.gpsPositions : [];
    return list
      .filter((v) => typeof v?.latitude === "number" && typeof v?.longitude === "number")
      .map((v) => ({
        vehicleId: String(v.vehicleId ?? ""),
        vehicleName: v.vehicleName ? String(v.vehicleName) : undefined,
        routeId: String(v.routeId ?? routeId),
        lat: v.latitude,
        lon: v.longitude,
        speed: typeof v.speed === "number" ? v.speed / 3.6 : undefined, // km/h -> m/s
        bearing: typeof v.orientation === "number" ? v.orientation : undefined,
        timestamp: v.timestamp ? Math.floor(new Date(v.timestamp).getTime() / 1000) : undefined,
      }));
  } catch (e) {
    console.error(`[actiosae] vehiclePosition route=${routeId} fetch error:`, (e as Error)?.message);
    return [];
  }
}

let cachedVehicles: VehiclePosition[] | null = null;
let cachedVehiclesAt = 0;
const VEHICLES_TTL_MS = 10_000;
let vehiclesInflight: Promise<VehiclePosition[]> | null = null;

export async function fetchAllVehiclePositions(): Promise<VehiclePosition[]> {
  const now = Date.now();
  if (cachedVehicles && now - cachedVehiclesAt < VEHICLES_TTL_MS) return cachedVehicles;
  if (vehiclesInflight) return vehiclesInflight;
  vehiclesInflight = (async () => {
    try {
      const results = await Promise.all(ROUTE_IDS.map(fetchVehiclesForRoute));
      const dedup = new Map<string, VehiclePosition>();
      for (const list of results) for (const v of list) {
        if (!v.vehicleId) continue;
        dedup.set(v.vehicleId, v);
      }
      cachedVehicles = Array.from(dedup.values());
      cachedVehiclesAt = Date.now();
      return cachedVehicles;
    } finally {
      vehiclesInflight = null;
    }
  })();
  return vehiclesInflight;
}

// In-memory cache to prevent upstream API abuse
let cachedArrivals: ArrivalData[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 15_000; // 15 seconds
const CACHE_STALE_MS = 120_000; // serve stale up to 2 min if upstream fails
let inflight: Promise<ArrivalData[]> | null = null;

export async function fetchAllArrivals(): Promise<ArrivalData[]> {
  const now = Date.now();
  if (cachedArrivals && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedArrivals;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const allArrivals: ArrivalData[] = [];
      // Mayor concurrencia para no agotar el límite de 30s del Worker.
      const batchSize = 25;
      for (let i = 0; i < STOP_IDS.length; i += batchSize) {
        const batch = STOP_IDS.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(fetchStopArrivals));
        for (const r of results) allArrivals.push(...r);
      }
      cachedArrivals = allArrivals;
      cacheTimestamp = Date.now();
      return allArrivals;
    } catch {
      // Si todo falla pero hay cache razonablemente reciente, sírvelo
      if (cachedArrivals && Date.now() - cacheTimestamp < CACHE_STALE_MS) {
        return cachedArrivals;
      }
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
