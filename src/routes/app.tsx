import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bus, Search, MapPin, RefreshCw, ArrowLeft, Map as MapIcon, CreditCard, Plus, Trash2, X, Pencil, ScanLine, Camera, Radio, CalendarClock } from "lucide-react";
import QRCode from "qrcode";
import stopsData from "@/data/stops.json";
import { loadCards, addCard, removeCard, updateCard, type BuscylCard } from "@/lib/buscyl-cards";
import SanAntonioBanner from "@/components/SanAntonioBanner";
import StopSanAntonioNotice from "@/components/StopSanAntonioNotice";
import StopScheduleViewer from "@/components/StopScheduleViewer";
import { slugForStop } from "@/data/stop-slugs";
import { stopSanAntonioStatus } from "@/lib/sanAntonio";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useIsIOS, haptic } from "@/hooks/use-platform";

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
  isScheduled?: boolean;
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
  const [tab, setTab] = useState<"stops" | "cards">("stops");
  const isIOS = useIsIOS();

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
      <header className="sticky top-0 z-10 glass-strong border-x-0 border-t-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="px-4 py-3 flex items-center gap-2">
          <Bus className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold">ArroyoBus</h1>
          <Link to="/" className="ml-auto text-xs text-muted-foreground underline">
            Web
          </Link>
        </div>
        {tab === "stops" && <div className="px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar parada por nombre o número…"
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl glass text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              inputMode="search"
            />
          </div>
          {userPos && (
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Ordenadas por cercanía
            </p>
          )}
        </div>}
      </header>

      {tab === "stops" ? <ul className={`flex-1 divide-y divide-border ${isIOS ? "pb-28" : ""}`}>
        <li className="px-3 py-3">
          <SanAntonioBanner compact />
        </li>
        {filtered.map((s) => {
          const dist = userPos ? distance(userPos, s) : null;
          const sa = stopSanAntonioStatus(s.id);
          return (
            <li key={s.id}>
              <button
                onClick={() => { haptic(); setSelected(s); }}
                className="ios-press w-full text-left px-4 py-3 flex items-center gap-3 active:bg-accent transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  {s.id}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.desc}</p>
                  {sa.kind !== "none" && (
                    <p className={`text-[10px] font-semibold mt-0.5 inline-flex items-center gap-1 ${
                      sa.kind === "plaza-espana" || sa.kind === "flecha-suspended"
                        ? "text-red-600 dark:text-red-400"
                        : sa.kind === "buho-fiestas"
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}>
                      {sa.kind === "plaza-espana" || sa.kind === "flecha-suspended" ? "⚠ Suspendida" : sa.kind === "buho-fiestas" ? "🌙 Búho Fiestas" : "★ Hub La Flecha"}
                    </p>
                  )}
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
      </ul> : <div className={isIOS ? "flex-1 pb-28" : "contents"}><CardsView /></div>}

      {isIOS ? (
        /* iPhone: dock flotante Liquid Glass (estilo iOS 26) */
        <nav
          className="fixed inset-x-0 z-20 px-6 pointer-events-none"
          style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          aria-label="Navegación"
        >
          <div className="ios-dock glass-strong pointer-events-auto mx-auto max-w-sm grid grid-cols-3 p-1.5">
            <button
              onClick={() => { haptic(); setTab("stops"); }}
              className={`ios-press rounded-full py-2 text-[11px] font-semibold flex flex-col items-center gap-0.5 ${tab === "stops" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
            >
              <Bus className="w-5 h-5" /> Paradas
            </button>
            <button
              onClick={() => { haptic(); setTab("cards"); }}
              className={`ios-press rounded-full py-2 text-[11px] font-semibold flex flex-col items-center gap-0.5 ${tab === "cards" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
            >
              <CreditCard className="w-5 h-5" /> Buscyl
            </button>
            <Link to="/" className="ios-press rounded-full py-2 text-[11px] font-semibold text-muted-foreground flex flex-col items-center gap-0.5">
              <MapIcon className="w-5 h-5" /> Mapa
            </Link>
          </div>
        </nav>
      ) : (
        <nav className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur">
          <div className="grid grid-cols-3">
            <button onClick={() => setTab("stops")} className={`py-3 text-xs font-medium flex flex-col items-center gap-0.5 ${tab === "stops" ? "text-primary" : "text-muted-foreground"}`}>
              <Bus className="w-5 h-5" /> Paradas
            </button>
            <button onClick={() => setTab("cards")} className={`py-3 text-xs font-medium flex flex-col items-center gap-0.5 ${tab === "cards" ? "text-primary" : "text-muted-foreground"}`}>
              <CreditCard className="w-5 h-5" /> Buscyl
            </button>
            <Link to="/" className="py-3 text-xs font-medium text-muted-foreground flex flex-col items-center gap-0.5">
              <MapIcon className="w-5 h-5" /> Mapa
            </Link>
          </div>
        </nav>
      )}
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
      <header className="sticky top-0 z-10 glass-strong border-x-0 border-t-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="px-3 py-3 flex items-center gap-2">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg active:bg-accent" aria-label="Volver">
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

      <div className="px-3 space-y-2">
        <StopSanAntonioNotice stopId={stop.id} compact />
        {slugForStop(stop.id) && (
          <Link
            to="/parada/$slug"
            params={{ slug: slugForStop(stop.id)! }}
            className="block text-center px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20"
          >
            <ExternalLink className="w-3 h-3 inline mr-1" />
            Ver página completa de la parada (ubicación, Street View, horario)
          </Link>
        )}
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
                  <span className="truncate">
                    {a.isScheduled
                      ? "Según horario"
                      : `Bus ${a.vehicleId}${a.isEstimated ? " · estimado" : ""}`}
                  </span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-base font-semibold tabular-nums ${a.isScheduled ? "text-muted-foreground" : ""}`}>
                  {min === 0 && !a.isScheduled ? "Ahora" : `${min}′`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(a.estimatedArrival * 1000).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-3 pb-4">
        <StopScheduleViewer stopId={stop.id} />
      </div>
    </div>
  );
}

const CARD_COLORS = ["#1d4ed8", "#0f766e", "#b45309", "#9333ea", "#dc2626", "#0891b2"];

function CardsView() {
  const [cards, setCards] = useState<BuscylCard[]>([]);
  const [editor, setEditor] = useState<{ mode: "new" } | { mode: "edit"; card: BuscylCard } | null>(null);
  const [viewing, setViewing] = useState<BuscylCard | null>(null);

  useEffect(() => {
    setCards(loadCards());
  }, []);

  const refresh = () => setCards(loadCards());

  return (
    <div className="flex-1 flex flex-col">
      {cards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <CreditCard className="w-8 h-8" />
          </div>
              <h2 className="text-base font-semibold">Tus tarjetas Buscyl</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Guarda el QR de tu tarjeta Buscyl en el dispositivo para enseñarlo en el bus sin conexión.
          </p>
        </div>
      ) : (
        <ul className="flex-1 p-3 grid grid-cols-1 gap-3">
          {cards.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setViewing(c)}
                className="w-full text-left rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.99] transition-transform"
                style={{ backgroundColor: c.color || "#1d4ed8", color: "white" }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider opacity-80">Buscyl</p>
                  <p className="text-sm font-semibold truncate">{c.label}</p>
                  <p className="text-[11px] opacity-80 truncate font-mono">{c.data}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="p-4">
        <button
          onClick={() => setEditor({ mode: "new" })}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:opacity-90"
        >
          <Plus className="w-4 h-4" /> Añadir tarjeta
        </button>
      </div>

      {editor && (
        <CardEditor
          initial={editor.mode === "edit" ? editor.card : null}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            refresh();
          }}
        />
      )}

      {viewing && (
        <CardViewer
          card={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditor({ mode: "edit", card: viewing });
            setViewing(null);
          }}
          onDelete={() => {
            removeCard(viewing.id);
            setViewing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function CardEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: BuscylCard | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState(initial?.label || "");
  const [data, setData] = useState(initial?.data || "");
  const [color, setColor] = useState(initial?.color || CARD_COLORS[0]);
  const [scanning, setScanning] = useState(false);

  const save = () => {
    const trimmedLabel = label.trim() || "Tarjeta Buscyl";
    const trimmedData = data.trim();
    if (!trimmedData) return;
    if (initial) {
      updateCard(initial.id, { label: trimmedLabel, data: trimmedData, color });
    } else {
      addCard({ label: trimmedLabel, data: trimmedData, color });
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold flex-1">{initial ? "Editar tarjeta" : "Nueva tarjeta Buscyl"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg active:bg-accent" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Nombre</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Mi tarjeta"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Contenido del QR (número o texto)</label>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Pega aquí el código de tu tarjeta Buscyl"
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={() => setScanning(true)}
            type="button"
            className="w-full mt-1 py-2.5 rounded-lg border border-border bg-card text-sm font-medium flex items-center justify-center gap-2 active:bg-accent"
          >
            <Camera className="w-4 h-4" /> Escanear QR con la cámara
          </button>
          <p className="text-[11px] text-muted-foreground">
            Se guarda solo en este dispositivo (almacenamiento local). Nada se envía a ningún servidor.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Color</label>
          <div className="flex gap-2 flex-wrap">
            {CARD_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={!data.trim()}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          {initial ? "Guardar cambios" : "Guardar tarjeta"}
        </button>
        {scanning && (
          <QrScanner
            onClose={() => setScanning(false)}
            onResult={(text) => {
              setData(text);
              setScanning(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function QrScanner({ onClose, onResult }: { onClose: () => void; onResult: (text: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let stopped = false;
    let controls: { stop: () => void } | null = null;
    let reader: { reset?: () => void } | null = null;

    (async () => {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (stopped) return;
        const codeReader = new BrowserQRCodeReader();
        reader = codeReader as unknown as { reset?: () => void };
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        const back = devices.find((d) => /back|rear|environment|trasera/i.test(d.label));
        const deviceId = back?.deviceId || devices[0]?.deviceId;
        if (!videoRef.current) return;
        const ctrl = await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (stopped) return;
            if (result) {
              const text = result.getText();
              if (text) {
                stopped = true;
                ctrl.stop();
                onResult(text);
              }
            }
            // ignore "not found" errors — they fire continuously while scanning
          }
        );
        controls = ctrl;
        setStarting(false);
      } catch (e: any) {
        setError(
          e?.name === "NotAllowedError"
            ? "Permiso de cámara denegado. Habilítalo en los ajustes del navegador."
            : e?.name === "NotFoundError"
            ? "No se ha detectado ninguna cámara."
            : "No se pudo iniciar la cámara."
        );
        setStarting(false);
      }
    })();

    return () => {
      stopped = true;
      try { controls?.stop(); } catch {}
      try { reader?.reset?.(); } catch {}
    };
  }, [onResult]);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const codeReader = new BrowserQRCodeReader();
      const url = URL.createObjectURL(file);
      try {
        const result = await codeReader.decodeFromImageUrl(url);
        const text = result.getText();
        if (text) onResult(text);
        else setError("No se ha encontrado ningún QR en la imagen.");
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setError("No se ha podido leer el QR de la imagen.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <header className="flex items-center gap-2 px-3 py-3 text-white">
        <button onClick={onClose} className="p-2 rounded-lg active:bg-white/10" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-semibold flex-1">Escanear QR Buscyl</h2>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] relative">
            <ScanLine className="absolute inset-0 m-auto w-10 h-10 text-white/70 animate-pulse" />
          </div>
        </div>
        {starting && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
            Iniciando cámara…
          </div>
        )}
        {error && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-black/70 text-white text-sm text-center">
            {error}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-xl bg-white/10 text-white text-sm font-medium flex items-center justify-center gap-2 active:bg-white/20"
        >
          <Camera className="w-4 h-4" /> Subir imagen del QR
        </button>
        <p className="text-[11px] text-white/60 text-center">
          Apunta la cámara al QR de tu tarjeta Buscyl. Se detectará automáticamente.
        </p>
      </div>
    </div>
  );
}

function CardViewer({
  card,
  onClose,
  onEdit,
  onDelete,
}: {
  card: BuscylCard;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [qr, setQr] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(card.data, { width: 600, margin: 2, errorCorrectionLevel: "M" })
      .then(setQr)
      .catch(() => setQr(""));
  }, [card.data]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col" onClick={onClose}>
      <div
        className="flex-1 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <header className="flex items-center gap-2 px-3 py-3 text-white">
          <button onClick={onClose} className="p-2 rounded-lg active:bg-white/10" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-semibold flex-1 truncate">{card.label}</h2>
          <button onClick={onEdit} className="p-2 rounded-lg active:bg-white/10" aria-label="Editar">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-lg active:bg-white/10" aria-label="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-2xl">
            {qr ? (
              <img src={qr} alt={`QR de ${card.label}`} className="w-64 h-64 sm:w-72 sm:h-72" />
            ) : (
              <div className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center text-xs text-muted-foreground">
                Generando…
              </div>
            )}
          </div>
          <div className="text-center text-white/90">
            <p className="text-xs uppercase tracking-wider opacity-70">Tarjeta Buscyl</p>
            <p className="text-base font-semibold">{card.label}</p>
            <p className="text-[11px] font-mono opacity-70 mt-1 break-all max-w-xs">{card.data}</p>
          </div>
        </div>

        {confirmDelete && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-6" onClick={() => setConfirmDelete(false)}>
            <div className="bg-background rounded-2xl p-5 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-base font-semibold">Eliminar tarjeta</h4>
              <p className="text-sm text-muted-foreground">¿Seguro que quieres eliminar “{card.label}”? Esta acción no se puede deshacer.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium">
                  Cancelar
                </button>
                <button onClick={onDelete} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
