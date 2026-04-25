import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bus, Search, MapPin, RefreshCw, ArrowLeft, Map as MapIcon } from "lucide-react";
import stopsData from "@/data/stops.json";

interface Stop { id: string; name: string; desc: string; lat: number; lon: number }
interface Arrival {
  tripId: string;
  vehicleId: string;
  routeId: string;
  routeName: string;
  routeShortName?: string;
  routeColor?: string;
  tripHeadsign?: string;
  estimatedArrival: number;
  minutesAway: number;
  isEstimated?: boolean;
}

export const Route = createFileRoute("/app")({
  component: AppPage,
  head: () => ({
    meta: [
      { title: "ArroyoBus — Próximas llegadas" },
      { name: "description", content: "Consulta las próximas llegadas de los autobuses de Arroyo de la Encomienda en tiempo real desde el móvil." },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1d4ed8" },
      { property: "og:title", content: "ArroyoBus — Próximas llegadas" },
      { property: "og:description", content: "Consulta las próximas llegadas de los autobuses de Arroyo de la Encomienda en tiempo real." },
    ],
  }),
});

const stops = stopsData as Stop[];

// Distancia haversine en metros
function distance(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function AppPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Stop | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = stops;
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id === q ||
          s.desc.toLowerCase().includes(q)
      );
    }
    if (userPos) {
      list = [...list].sort(
        (a, b) => distance(userPos, a) - distance(userPos, b)
      );
    } else {
      list = [...list].sort((a, b) => Number(a.id) - Number(b.id));
    }
    return list;
  }, [query, userPos]);

  if (selected) {
    return <StopDetail stop={selected} onBack={() => setSelected(null)} userPos={userPos} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="px-4 py-3 flex items-center gap-2">
          <Bus className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold">ArroyoBus</h1>
          <Link to="/" className="ml-auto text-xs text-muted-foreground underline">
            Web
          </Link>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar parada por nombre o número…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              inputMode="search"
            />
          </div>
          {userPos && (
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Ordenadas por cercanía
            </p>
          )}
        </div>
      </header>

      <ul className="flex-1 divide-y divide-border">
        {filtered.map((s) => {
          const dist = userPos ? distance(userPos, s) : null;
          return (
            <li key={s.id}>
              <button
                onClick={() => setSelected(s)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 active:bg-accent transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  {s.id}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.desc}</p>
                </div>
                {dist != null && (
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`}
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay paradas que coincidan
          </li>
        )}
      </ul>

      <nav className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="grid grid-cols-2">
          <button className="py-3 text-xs font-medium text-primary flex flex-col items-center gap-0.5">
            <Bus className="w-5 h-5" /> Paradas
          </button>
          <Link to="/" className="py-3 text-xs font-medium text-muted-foreground flex flex-col items-center gap-0.5">
            <MapIcon className="w-5 h-5" /> Mapa
          </Link>
        </div>
      </nav>
    </div>
  );
}

function StopDetail({ stop, onBack, userPos }: { stop: Stop; onBack: () => void; userPos: { lat: number; lon: number } | null }) {
  const [arrivals, setArrivals] = useState<Arrival[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<string>("");

  const load = async () => {
    try {
      const res = await fetch(`/api/stops/${stop.id}`);
      if (!res.ok) return;
      const json = await res.json();
      setArrivals(json.arrivals || []);
      setUpdated(new Date().toLocaleTimeString("es-ES"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop.id]);

  const dist = userPos ? distance(userPos, stop) : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="px-3 py-3 flex items-center gap-2">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg active:bg-accent">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">Parada {stop.id} · {stop.desc}</p>
            <h2 className="text-sm font-semibold truncate">{stop.name}</h2>
          </div>
          <button onClick={load} className="p-2 rounded-lg active:bg-accent" aria-label="Refrescar">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <div className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>{updated && `Actualizado ${updated}`}</span>
        {dist != null && <span>{dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`}</span>}
      </div>

      <ul className="flex-1 divide-y divide-border">
        {loading && !arrivals && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">Cargando llegadas…</li>
        )}
        {arrivals && arrivals.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay llegadas próximas en este momento
          </li>
        )}
        {arrivals?.map((a) => {
          const color = a.routeColor ? `#${a.routeColor}` : undefined;
          const short = a.routeShortName || a.routeName || "—";
          const min = a.minutesAway;
          return (
            <li key={`${a.tripId}-${a.vehicleId}-${a.estimatedArrival}`} className="px-4 py-3 flex items-center gap-3">
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white shrink-0"
                style={{ backgroundColor: color || "hsl(var(--primary))" }}
              >
                {short}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{a.tripHeadsign || a.routeName}</p>
                <p className="text-[11px] text-muted-foreground">Bus {a.vehicleId}{a.isEstimated ? " · estimado" : ""}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-semibold tabular-nums">
                  {min === 0 ? "Ahora" : `${min}′`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(a.estimatedArrival * 1000).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
