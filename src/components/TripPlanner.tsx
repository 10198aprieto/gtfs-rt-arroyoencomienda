import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, MapPin, Navigation, Loader2, ChevronRight, Footprints, Bus,
  ArrowRight, CreditCard, RefreshCw, Clock,
} from "lucide-react";
import stopsData from "@/data/stops.json";
import { slugForStop } from "@/data/stop-slugs";
import { planTripFn } from "@/lib/planner/plan.functions";

interface Stop { id: string; name: string; desc: string; lat: number; lon: number }
const stops = stopsData as Stop[];

interface Suggestion { id: string; name: string; detail: string; lat: number; lon: number; stopId?: string }

type WalkLeg = { kind: "walk"; meters: number; seconds: number; toName: string };
type BusLeg = {
  kind: "bus"; net: "AB" | "AV"; routeId: string; routeShort: string; routeLong: string;
  color: string; headsign: string;
  from: { id: string; name: string; lat: number; lon: number };
  to: { id: string; name: string; lat: number; lon: number };
  depart: number; arrive: number; stopsCount: number; live: boolean;
};
type Leg = WalkLeg | BusLeg;
interface TripOption { id: string; depart: number; arrive: number; totalMinutes: number; legs: Leg[]; usesAuvasa: boolean }
interface PlanResult {
  options: TripOption[];
  origin: { lat: number; lon: number; label: string };
  destination: { lat: number; lon: number; label: string };
  fallbackStop?: { id: string; name: string; meters: number };
}

const hhmm = (t: number) =>
  new Date(t * 1000).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
const distText = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`);

/** Sugerencias combinadas: paradas de ArroyoBus + calles y lugares (OpenStreetMap). */
function useSuggestions(query: string) {
  const [osm, setOsm] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) { setOsm([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const url =
          "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=es" +
          "&viewbox=-5.05,41.78,-4.55,41.50&bounded=1&q=" + encodeURIComponent(q);
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("osm");
        const data = (await res.json()) as Array<Record<string, string>>;
        if (cancelled) return;
        setOsm(
          data.map((d) => {
            const parts = String(d.display_name || "").split(",").map((x) => x.trim());
            return {
              id: `osm-${d.place_id}`,
              name: d.name || parts[0] || "Lugar",
              detail: parts.slice(1, 3).join(", "),
              lat: parseFloat(d.lat!),
              lon: parseFloat(d.lon!),
            };
          }),
        );
      } catch {
        if (!cancelled) setOsm([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const stopMatches = useMemo<Suggestion[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return stops
      .filter((s) => s.name.toLowerCase().includes(q) || (s.desc ?? "").toLowerCase().includes(q) || s.id === q)
      .slice(0, 4)
      .map((s) => ({ id: `stop-${s.id}`, name: s.name, detail: `Parada ${s.id} · ${s.desc}`, lat: s.lat, lon: s.lon, stopId: s.id }));
  }, [query]);

  return { stopMatches, osm, loading };
}

function PlaceField({
  label, placeholder, value, onPick, icon, allowLocation, onUseLocation, locating,
}: {
  label: string;
  placeholder: string;
  value: string;
  onPick: (s: Suggestion) => void;
  icon: React.ReactNode;
  allowLocation?: boolean;
  onUseLocation?: () => void;
  locating?: boolean;
}) {
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const { stopMatches, osm, loading } = useSuggestions(open ? text : "");

  useEffect(() => { setText(value); }, [value]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const items = [...stopMatches, ...osm];

  return (
    <div className="relative" ref={box}>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-24 py-3.5 rounded-2xl glass text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          inputMode="search"
        />
        {allowLocation && (
          <button
            type="button"
            onClick={onUseLocation}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold hover:bg-accent transition-colors"
          >
            {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
            Mi ubicación
          </button>
        )}
      </div>
      {open && (items.length > 0 || loading) && (
        <ul className="absolute z-30 mt-2 w-full rounded-2xl glass-strong overflow-hidden animate-fade-in max-h-72 overflow-y-auto">
          {items.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => { onPick(s); setText(s.name); setOpen(false); }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-accent/60 transition-colors"
              >
                {s.stopId
                  ? <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  : <Navigation className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                <span className="min-w-0">
                  <span className="block text-sm font-medium truncate">{s.name}</span>
                  <span className="block text-[11px] text-muted-foreground truncate">{s.detail}</span>
                </span>
              </button>
            </li>
          ))}
          {loading && (
            <li className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando…
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function LegRow({ leg }: { leg: Leg }) {
  if (leg.kind === "walk") {
    return (
      <li className="flex items-start gap-3 py-2">
        <Footprints className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div className="text-sm">
          Camina <b>{Math.max(1, Math.round(leg.seconds / 60))} min</b>{" "}
          <span className="text-muted-foreground">({distText(leg.meters)}) hasta {leg.toName}</span>
        </div>
      </li>
    );
  }
  const color = `#${leg.color.replace("#", "")}`;
  const slug = leg.net === "AB" ? slugForStop(leg.from.id) : null;
  return (
    <li className="flex items-start gap-3 py-2">
      <Bus className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
      <div className="text-sm min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {leg.net === "AV" ? `AUVASA ${leg.routeShort}` : leg.routeShort}
          </span>
          <span className="text-muted-foreground truncate">{leg.headsign || leg.routeLong}</span>
        </div>
        <div className="mt-1">
          Sube en <b>{leg.from.name}</b>
          {leg.net === "AB" && slug ? (
            <>
              {" "}
              <Link to="/parada/$slug" params={{ slug }} className="text-primary underline">
                (parada {leg.from.id})
              </Link>
            </>
          ) : null}{" "}
          a las <b className="tabular-nums">{hhmm(leg.depart)}</b>
          {leg.live && <span className="ml-1 text-[10px] font-semibold text-emerald-500 uppercase">en vivo</span>}
        </div>
        <div className="text-muted-foreground">
          Bájate en <b className="text-foreground">{leg.to.name}</b> · {hhmm(leg.arrive)} · {leg.stopsCount} paradas
        </div>
      </div>
    </li>
  );
}

function OptionCard({ opt, best }: { opt: TripOption; best: boolean }) {
  const buses = opt.legs.filter((l): l is BusLeg => l.kind === "bus");
  return (
    <div className={`glass rounded-2xl p-4 ${best ? "ring-1 ring-primary/40" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {buses.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: `#${b.color.replace("#", "")}` }}
              >
                {b.net === "AV" ? `AUVASA ${b.routeShort}` : b.routeShort}
              </span>
            </span>
          ))}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold tabular-nums leading-none">{opt.totalMinutes} min</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">llegas {hhmm(opt.arrive)}</div>
        </div>
      </div>
      <ul className="mt-3 divide-y divide-border">
        {opt.legs.map((l, i) => <LegRow key={i} leg={l} />)}
      </ul>
      {opt.usesAuvasa && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-300">
          <CreditCard className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>
            En los autobuses urbanos de Valladolid <b>no sirve la tarjeta BusCyL</b>. Necesitas el bonobús de AUVASA,
            el QR de la app «Auvasa PAY», pago en metálico al conductor o pago con tarjeta bancaria (EMV) a bordo.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TripPlanner() {
  const plan = useServerFn(planTripFn);
  const [from, setFrom] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [fromText, setFromText] = useState("");
  const [to, setTo] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [toText, setToText] = useState("");
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const useLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setFrom({ lat: p.coords.latitude, lon: p.coords.longitude, label: "Tu ubicación" });
        setFromText("Mi ubicación");
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  };

  useEffect(() => { useLocation(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const search = async () => {
    if (!to) { setError("Elige un destino de la lista."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await plan({
        data: {
          from: from ?? (fromText.trim().length > 2 ? fromText.trim() : { lat: 41.6255, lon: -4.7902, label: "Arroyo de la Encomienda" }),
          to,
        },
      });
      if (res.error) { setError(res.error); setResult(null); }
      else setResult(res.result as PlanResult);
    } catch {
      setError("No hemos podido calcular la ruta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label="Planificador de viaje" className="space-y-3">
      <h3 className="text-sm font-semibold">¿A dónde vas?</h3>
      <PlaceField
        label="Destino"
        placeholder="Plaza Mayor, Calle Zorrilla 120, Hospital Río Hortega…"
        value={toText}
        icon={<Search className="w-4 h-4" />}
        onPick={(s) => { setTo({ lat: s.lat, lon: s.lon, label: s.name }); setToText(s.name); }}
      />
      <PlaceField
        label="Desde"
        placeholder="Mi ubicación o una dirección"
        value={fromText}
        icon={<MapPin className="w-4 h-4" />}
        allowLocation
        locating={locating}
        onUseLocation={useLocation}
        onPick={(s) => { setFrom({ lat: s.lat, lon: s.lon, label: s.name }); setFromText(s.name); }}
      />
      <button
        onClick={search}
        disabled={loading || !to}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        Cómo llegar
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[0, 1].map((i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          {result.options.length === 0 ? (
            <div className="glass rounded-2xl p-4 text-sm text-muted-foreground space-y-2">
              <p>No hemos encontrado un trayecto en bus para esa hora.</p>
              {result.fallbackStop && (
                <p>
                  La parada más cercana a {result.destination.label} es{" "}
                  <b className="text-foreground">{result.fallbackStop.name}</b> (
                  {distText(result.fallbackStop.meters)}).
                  {slugForStop(result.fallbackStop.id) && (
                    <>
                      {" "}
                      <Link
                        to="/parada/$slug"
                        params={{ slug: slugForStop(result.fallbackStop.id)! }}
                        className="text-primary underline inline-flex items-center gap-1"
                      >
                        Ver parada <ChevronRight className="w-3 h-3" />
                      </Link>
                    </>
                  )}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Salida desde {result.origin.label} · destino {result.destination.label}
                </span>
                <button onClick={search} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  <RefreshCw className="w-3 h-3" /> Actualizar
                </button>
              </div>
              {result.options.map((o, i) => <OptionCard key={o.id} opt={o} best={i === 0} />)}
            </>
          )}
        </div>
      )}
    </section>
  );
}
