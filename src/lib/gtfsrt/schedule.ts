import schedule from "@/data/schedule.json";

interface ScheduleEntry {
  tripId: string;
  serviceId: string;
  routeId: string;
  routeShortName: string;
  routeColor: string;
  headsign: string;
  sec: number;
}
interface ServiceInfo { days: boolean[]; start: string; end: string }
interface ScheduleData {
  services: Record<string, ServiceInfo>;
  stops: Record<string, ScheduleEntry[]>;
}
const data = schedule as unknown as ScheduleData;

function madridParts(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(d);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  const wd: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const hour = m.hour === "24" ? 0 : Number(m.hour);
  return {
    weekday: wd[m.weekday] ?? 0,
    date: `${m.year}${m.month}${m.day}`,
    sec: hour * 3600 + Number(m.minute) * 60 + Number(m.second),
  };
}

export interface ScheduledArrival {
  tripId: string;
  routeId: string;
  routeShortName: string;
  routeColor: string;
  tripHeadsign: string;
  estimatedArrival: number; // unix seconds
  minutesAway: number;
  isScheduled: true;
}

export function getScheduledArrivals(stopId: string, max = 8): ScheduledArrival[] {
  const list = data.stops[String(stopId)] || [];
  if (!list.length) return [];
  const { weekday, date, sec } = madridParts();
  const active = new Set<string>();
  for (const [id, s] of Object.entries(data.services)) {
    if (s.days[weekday] && date >= s.start && date <= s.end) active.add(id);
  }
  if (!active.size) return [];
  const nowEpoch = Math.floor(Date.now() / 1000);
  const midnightEpoch = nowEpoch - sec;
  const out: ScheduledArrival[] = [];
  for (const e of list) {
    if (!active.has(e.serviceId)) continue;
    if (e.sec < sec - 60) continue;
    const eta = midnightEpoch + e.sec;
    out.push({
      tripId: e.tripId,
      routeId: e.routeId,
      routeShortName: e.routeShortName,
      routeColor: e.routeColor,
      tripHeadsign: e.headsign,
      estimatedArrival: eta,
      minutesAway: Math.max(0, Math.round((eta - nowEpoch) / 60)),
      isScheduled: true,
    });
    if (out.length >= max) break;
  }
  return out;
}
