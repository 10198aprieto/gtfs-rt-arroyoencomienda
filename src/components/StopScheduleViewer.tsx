import { useMemo, useState } from "react";
import scheduleJson from "@/data/schedule.json";
import { Calendar } from "lucide-react";

interface Trip { tripId: string; serviceId: string; routeId: string; routeShortName: string; routeColor: string; headsign: string; sec: number }
interface Schedule { services: Record<string,{days:boolean[];start:string;end:string}>; stops: Record<string, Trip[]> }
const S = scheduleJson as Schedule;

const DAY_LABELS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

function ymdToDate(s: string): Date { return new Date(+s.slice(0,4), +s.slice(4,6)-1, +s.slice(6,8)); }
function fmtTime(sec: number): string {
  const h = Math.floor(sec/3600) % 24;
  const m = Math.floor((sec%3600)/60);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

/** Para un día dado (Date), devuelve los serviceIds activos. */
function servicesForDate(date: Date): Set<string> {
  const idx = date.getDay(); // 0=Dom..6=Sáb — coincide con el formato del schedule
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  const out = new Set<string>();
  for (const [sid, def] of Object.entries(S.services)) {
    if (yyyymmdd < def.start || yyyymmdd > def.end) continue;
    if (def.days[idx]) out.add(sid);
  }
  return out;
}

export default function StopScheduleViewer({ stopId }: { stopId: string }) {
  const trips = S.stops[String(stopId)] || [];
  const [offset, setOffset] = useState(0);

  const date = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(0,0,0,0);
    return d;
  }, [offset]);

  const services = useMemo(() => servicesForDate(date), [date]);

  const dayTrips = useMemo(() => {
    return trips
      .filter((t) => services.has(t.serviceId))
      .sort((a,b) => a.sec - b.sec);
  }, [trips, services]);

  const byRoute = useMemo(() => {
    const m = new Map<string, Trip[]>();
    for (const t of dayTrips) {
      const arr = m.get(t.routeShortName) ?? [];
      arr.push(t);
      m.set(t.routeShortName, arr);
    }
    return Array.from(m.entries());
  }, [dayTrips]);

  const dayLabel = DAY_LABELS[date.getDay()];
  const dateLabel = date.toLocaleDateString("es-ES", { day: "numeric", month: "long" });

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">{dayLabel}, {dateLabel}</p>
            <p className="text-[11px] text-muted-foreground">Horarios programados</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setOffset(o => o-1)} className="px-2 py-1 rounded-md hover:bg-accent text-sm" aria-label="Día anterior">‹</button>
          <button onClick={() => setOffset(0)} className="px-2 py-1 rounded-md text-xs font-medium hover:bg-accent">Hoy</button>
          <button onClick={() => setOffset(o => o+1)} className="px-2 py-1 rounded-md hover:bg-accent text-sm" aria-label="Día siguiente">›</button>
        </div>
      </div>

      {byRoute.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          No hay servicio este día.
        </div>
      ) : (
        <div className="divide-y divide-border max-h-80 overflow-y-auto">
          {byRoute.map(([short, list]) => (
            <div key={short} className="px-3 py-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: `#${list[0].routeColor}` }}
                >
                  {short}
                </span>
                <span className="text-[11px] text-muted-foreground">{list.length} salidas</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {list.map((t, i) => (
                  <span key={`${t.tripId}-${i}`} className="px-2 py-0.5 rounded bg-muted text-xs font-mono tabular-nums">
                    {fmtTime(t.sec)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}