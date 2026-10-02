import { useState } from "react";
import { Megaphone, Loader2, MapPin } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { reportPassengerIncident, PASSENGER_TYPES, PASSENGER_DISCLAIMER, type PassengerType } from "@/lib/passenger/report.functions";
import { routeColor, routeMeta } from "@/data/routes";

interface NearBus { id: string; label: string; routeId: string; dist: number }

function distM(a: number, b: number, c: number, d: number) {
  const R = 6371000, r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export default function PassengerReport() {
  const send = useServerFn(reportPassengerIncident);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"idle" | "locating" | "pick" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const [buses, setBuses] = useState<NearBus[]>([]);
  const [bus, setBus] = useState("");
  const [type, setType] = useState<PassengerType>("delay");
  const [text, setText] = useState("");

  const locate = () => {
    setError("");
    if (!navigator.geolocation) return setError("Tu dispositivo no permite saber tu ubicación.");
    setStep("locating");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const me = { lat: p.coords.latitude, lon: p.coords.longitude };
        setPos(me);
        try {
          const res = await fetch("/api/gtfs-rt/vehicle-positions?format=json");
          const j = await res.json();
          const list: NearBus[] = (j.entity || [])
            .map((e: any) => {
              const v = e.vehicle, ps = v?.position;
              if (!ps?.latitude) return null;
              return { id: String(v.vehicle?.id ?? e.id), label: String(v.vehicle?.label ?? v.vehicle?.id ?? e.id), routeId: v.trip?.routeId || "", dist: distM(me.lat, me.lon, ps.latitude, ps.longitude) };
            })
            .filter((b: NearBus | null): b is NearBus => !!b && b.dist <= 1500)
            .sort((a: NearBus, b: NearBus) => a.dist - b.dist)
            .slice(0, 5);
          setBuses(list);
          setBus(list[0]?.id || "");
          if (!list.length) setError("No hay ningún bus activo cerca de ti ahora mismo.");
          setStep("pick");
        } catch {
          setError("No se pudieron cargar los buses.");
          setStep("idle");
        }
      },
      () => { setError("Necesitamos tu ubicación para saber en qué bus vas."); setStep("idle"); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async () => {
    if (!pos || !bus) return;
    setError("");
    setStep("sending");
    try {
      const r = await send({ data: { vehicleId: bus, type, text: text.trim(), lat: pos.lat, lon: pos.lon } });
      if (!r.ok) { setError(r.error); setStep("pick"); return; }
      setStep("done");
      setText("");
    } catch (e) {
      setError(e instanceof Error && e.message.includes("caracteres") ? e.message : "Revisa el texto (3–300 caracteres).");
      setStep("pick");
    }
  };

  return (
    <div className="glass rounded-2xl p-4">
      <button onClick={() => { setOpen((o) => !o); if (!open && step === "idle") locate(); }} className="w-full flex items-center gap-3 text-left">
        <div className="p-2 rounded-full bg-primary/10 text-primary"><Megaphone className="w-5 h-5" /></div>
        <div className="flex-1">
          <div className="text-sm font-semibold">¿Pasa algo en tu bus?</div>
          <div className="text-xs text-muted-foreground">Avisa al resto de pasajeros de una incidencia.</div>
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-xs rounded-lg bg-muted p-2 text-muted-foreground">{PASSENGER_DISCLAIMER} El aviso se borra solo a los 15 minutos.</p>

          {step === "locating" && <div className="flex items-center gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Buscando tu bus…</div>}

          {step === "done" && (
            <div className="text-sm font-medium">✅ Aviso publicado en /avisos y en Telegram. Gracias.
              <button onClick={() => { setStep("idle"); locate(); }} className="block mt-2 text-xs underline text-muted-foreground">Enviar otro</button>
            </div>
          )}

          {(step === "pick" || step === "sending") && buses.length > 0 && (
            <>
              <div>
                <div className="text-xs font-semibold mb-1.5">¿En qué bus vas?</div>
                <div className="flex flex-wrap gap-2">
                  {buses.map((b) => {
                    const c = routeColor(b.routeId);
                    const sel = b.id === bus;
                    return (
                      <button key={b.id} onClick={() => setBus(b.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                        style={sel ? { background: c, borderColor: c, color: "#fff" } : { borderColor: `${c}66`, color: c }}>
                        {routeMeta(b.routeId)?.name || b.routeId || "Bus"} · {b.label} · {Math.round(b.dist)} m
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5">Tipo</div>
                <select value={type} onChange={(e) => setType(e.target.value as PassengerType)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {PASSENGER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 300))} rows={3}
                placeholder="Cuéntalo en pocas palabras…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{text.length}/300</span>
                <button onClick={submit} disabled={step === "sending" || text.trim().length < 3 || !bus}
                  className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                  {step === "sending" ? "Publicando…" : "Publicar aviso"}
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="text-xs text-destructive flex items-center gap-2">
              {error}
              {step !== "locating" && <button onClick={locate} className="underline inline-flex items-center gap-1"><MapPin className="w-3 h-3" />Reintentar</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
