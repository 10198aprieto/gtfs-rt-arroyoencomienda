import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ExternalLink, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { listActiveAlertsPublic, CAUSE_LABELS, EFFECT_LABELS } from "@/lib/admin/alerts.functions";
import stopsData from "@/data/stops.json";

const STOPS = stopsData as Array<{ id: string; name: string }>;

export const Route = createFileRoute("/avisos")({
  component: AvisosPage,
  head: () => ({
    meta: [
      { title: "Avisos y alertas — ArroyoBus" },
      { name: "description", content: "Avisos activos del servicio de autobuses: incidencias, desvíos y cambios de recorrido." },
    ],
  }),
});

function AvisosPage() {
  const load = useServerFn(listActiveAlertsPublic);
  const [alerts, setAlerts] = useState<any[] | null>(null);
  useEffect(() => { load().then(setAlerts).catch(() => setAlerts([])); }, [load]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <header className="mt-6 flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/15 p-2 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Avisos y alertas</h1>
            <p className="text-sm text-muted-foreground">Incidencias activas publicadas por ArroyoBus.</p>
          </div>
        </header>

        <div className="mt-8 space-y-4">
          {alerts === null && <p className="text-sm text-muted-foreground">Cargando…</p>}
          {alerts && alerts.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No hay avisos activos ahora mismo. 🎉
            </div>
          )}
          {alerts?.map((a) => (
            <article key={a.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold">{a.header}</h2>
                <span className="shrink-0 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-semibold px-2 py-0.5">
                  {EFFECT_LABELS[a.effect] || a.effect}
                </span>
              </div>
              {a.description && <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">{a.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
                  Causa: <strong className="text-foreground">{CAUSE_LABELS[a.cause] || a.cause}</strong>
                </span>
                {a.route_ids?.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
                    Líneas: <strong className="text-foreground">{a.route_ids.join(", ")}</strong>
                  </span>
                )}
                {a.stop_ids?.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
                    Paradas: <strong className="text-foreground">{a.stop_ids.slice(0,5).map((id: string) => STOPS.find(s=>s.id===id)?.name || id).join(" · ")}{a.stop_ids.length>5?` +${a.stop_ids.length-5}`:""}</strong>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
                  <Clock className="h-3 w-3" /> desde {new Date(a.starts_at).toLocaleString("es-ES")}
                  {a.ends_at && ` · hasta ${new Date(a.ends_at).toLocaleString("es-ES")}`}
                </span>
              </div>
              {a.url && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  Más información <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}