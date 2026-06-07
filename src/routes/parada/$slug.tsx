import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Navigation, Eye, RefreshCw, Bus, Radio, CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import stopsData from "@/data/stops.json";
import { stopIdForSlug, slugForStop } from "@/data/stop-slugs";
import StopSanAntonioNotice from "@/components/StopSanAntonioNotice";
import StopScheduleViewer from "@/components/StopScheduleViewer";

interface Stop { id: string; name: string; desc: string; lat: number; lon: number }
const stops = stopsData as Stop[];

export const Route = createFileRoute("/parada/$slug")({
  loader: ({ params }) => {
    const id = stopIdForSlug(params.slug);
    if (!id) throw notFound();
    const stop = stops.find((s) => s.id === id);
    if (!stop) throw notFound();
    return { stop };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.stop.name} — Parada ${loaderData.stop.id} · ArroyoBus` },
      { name: "description", content: `Próximas llegadas en tiempo real, horario diario y ubicación de la parada ${loaderData.stop.name} (${loaderData.stop.desc}).` },
      { property: "og:title", content: `${loaderData.stop.name} — ArroyoBus` },
      { property: "og:description", content: `Llegadas en vivo y horarios de la parada ${loaderData.stop.id}.` },
    ] : [],
  }),
  component: ParadaPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-3">
      <h1 className="text-2xl font-bold">Parada no encontrada</h1>
      <Link to="/app" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Ver todas las paradas</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p className="text-sm text-muted-foreground">Error: {error.message}</p>
    </div>
  ),
});

interface Arrival {
  tripId: string; vehicleId: string; routeId: string; routeName: string;
  routeShortName?: string; routeColor?: string; tripHeadsign?: string;
  estimatedArrival: number; minutesAway: number; isEstimated?: boolean; isScheduled?: boolean;
}

function ParadaPage() {
  const { stop } = Route.useLoaderData();
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
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop.id]);

  const gmapsDir = `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lon}`;
  const gmapsStreetView = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${stop.lat},${stop.lon}`;
  const mapEmbed = `https://maps.google.com/maps?q=${stop.lat},${stop.lon}&z=17&output=embed`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/app" className="p-2 -ml-2 rounded-lg hover:bg-accent" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">Parada {stop.id} · {stop.desc}</p>
            <h1 className="text-base font-semibold truncate">{stop.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <StopSanAntonioNotice stopId={stop.id} />

        <section className="rounded-xl overflow-hidden border border-border bg-card">
          <iframe
            title={`Mapa de ${stop.name}`}
            src={mapEmbed}
            className="w-full h-56 sm:h-72 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="p-3 flex flex-wrap gap-2">
            <a href={gmapsDir} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
              <Navigation className="w-4 h-4" /> Cómo llegar
            </a>
            <a href={gmapsStreetView} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent">
              <Eye className="w-4 h-4" /> Street View
            </a>
            <a href={`https://www.google.com/maps?q=${stop.lat},${stop.lon}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent">
              <MapPin className="w-4 h-4" /> Abrir en Google Maps
            </a>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Bus className="w-4 h-4 text-primary" /> Próximas llegadas
            </h2>
            <button onClick={load} className="p-1.5 rounded-md hover:bg-accent" aria-label="Refrescar">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <ul className="divide-y divide-border">
            {loading && !arrivals && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">Cargando…</li>
            )}
            {arrivals && arrivals.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">Sin llegadas próximas.</li>
            )}
            {arrivals?.map((a) => {
              const color = a.routeColor ? `#${a.routeColor}` : undefined;
              const short = a.routeShortName || a.routeName || "—";
              return (
                <li key={`${a.tripId}-${a.vehicleId}-${a.estimatedArrival}`} className="px-4 py-3 flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: color || "hsl(var(--primary))" }}>{short}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.tripHeadsign || a.routeName}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      {a.isScheduled ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium">
                          <CalendarClock className="w-3 h-3" /> Horario
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium">
                          <Radio className="w-3 h-3" /> En vivo
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-base font-semibold tabular-nums ${a.isScheduled ? "text-muted-foreground" : ""}`}>
                      {a.minutesAway === 0 && !a.isScheduled ? "Ahora" : `${a.minutesAway}′`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(a.estimatedArrival * 1000).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          {updated && <p className="px-4 py-2 text-[11px] text-muted-foreground">Actualizado {updated}</p>}
        </section>

        <StopScheduleViewer stopId={stop.id} />

        <p className="text-xs text-muted-foreground text-center pb-6">
          Coordenadas: <code>{stop.lat.toFixed(5)}, {stop.lon.toFixed(5)}</code> ·{" "}
          <Link to="/app" className="underline">Ver todas las paradas</Link>
        </p>
      </main>
    </div>
  );
}

// Helper export (no usado por la ruta pero útil en otras pantallas)
export { slugForStop };