import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Search, Hash, Loader2 } from "lucide-react";
import stopsData from "@/data/stops.json";
import { STOP_SLUGS } from "@/data/stop-slugs";

type Stop = { id: string; name: string; desc?: string; lat: number; lon: number };

const LOCAL_STOPS = stopsData as Stop[];
const API_URL = "https://arroyobus-api.lovable.app/gtfs/stops.json";

export const Route = createFileRoute("/paradas")({
  component: ParadasPage,
  head: () => ({
    meta: [
      { title: "Consulta de paradas — ArroyoBus" },
      {
        name: "description",
        content:
          "Consulta el número GTFS de cada parada de ArroyoBus: busca por nombre o localidad y consulta su identificador oficial del GTFS estático.",
      },
      { property: "og:title", content: "Consulta de paradas — ArroyoBus" },
      {
        property: "og:description",
        content:
          "Consulta el número GTFS de cada parada de ArroyoBus: busca por nombre o localidad y consulta su identificador oficial del GTFS estático.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function ParadasPage() {
  const [stops, setStops] = useState<Stop[]>(LOCAL_STOPS);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(API_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((rows: any[]) => {
        if (cancelled || !Array.isArray(rows)) return;
        setStops(
          rows.map((r) => ({
            id: String(r.stop_id),
            name: String(r.stop_name),
            desc: r.stop_desc ? String(r.stop_desc) : undefined,
            lat: Number(r.stop_lat),
            lon: Number(r.stop_lon),
          }))
        );
        setLoading(false);
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return stops;
    return stops.filter(
      (s) => normalize(s.name).includes(q) || normalize(s.desc ?? "").includes(q) || s.id === q
    );
  }, [stops, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <header className="mt-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Paradas</h1>
            <p className="text-sm text-muted-foreground">
              Número oficial de cada parada según el GTFS estático.
              {loading && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" /> Actualizando…
                </span>
              )}
            </p>
          </div>
        </header>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca por nombre, localidad o número de parada…"
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {filtered.length} de {stops.length} paradas
        </p>

        <ul className="mt-4 space-y-2">
          {filtered.map((s) => {
            const slug = STOP_SLUGS[s.id];
            const content = (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-sm font-bold text-primary">
                  <Hash className="mr-0.5 h-3 w-3 opacity-60" />
                  {s.id}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  {s.desc && <p className="truncate text-xs text-muted-foreground">{s.desc}</p>}
                </div>
              </div>
            );
            return (
              <li key={s.id}>
                {slug ? (
                  <Link to="/parada/$slug" params={{ slug }}>{content}</Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No hay paradas que coincidan con «{query}».
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
