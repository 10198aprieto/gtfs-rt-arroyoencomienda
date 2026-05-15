import { createFileRoute, Link } from "@tanstack/react-router";
import { Bus, MapPin, Clock, ExternalLink, Download, Smartphone, Send, Copy, Check, Activity, Radio, Github, MessageCircle, Mic, Sparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";

const BusMap = lazy(() => import("@/components/BusMap"));

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ArroyoBus — Autobuses en tiempo real" },
      { name: "description", content: "Sigue en tiempo real los autobuses de Arroyo de la Encomienda. Llegadas, posiciones GPS, feed GTFS-RT y bot de Telegram." },
    ],
  }),
});

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(window.location.origin + value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-accent transition-all"
      aria-label="Copiar URL"
    >
      {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
    </button>
  );
}

function LiveStats() {
  const [vehicles, setVehicles] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/gtfs-rt/vehicle-positions?format=json");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setVehicles((data.entity ?? []).length);
          setPulse(true);
          setTimeout(() => setPulse(false), 600);
        }
      } catch {}
    };
    fetchCount();
    const id = setInterval(fetchCount, 15_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const stats = [
    { label: "Buses en circulación", value: vehicles == null ? "—" : vehicles, icon: Bus, live: true },
    { label: "Paradas", value: "73", icon: MapPin, live: false },
    { label: "Líneas", value: "2", icon: Activity, live: false },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div key={s.label} className="relative p-4 rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <s.icon className="w-4 h-4 text-primary" />
            {s.live && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-primary uppercase tracking-wider">
                <span className={`w-1.5 h-1.5 rounded-full bg-primary ${pulse ? "animate-ping" : ""}`} />
                Live
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{s.value}</div>
          <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function Index() {
  const endpoints = [
    {
      title: "Trip Updates",
      description: "Estimaciones de llegada en tiempo real para cada parada y viaje activo.",
      pb: "/api/gtfs-rt/trip-updates",
      json: "/api/gtfs-rt/trip-updates?format=json",
      icon: Clock,
    },
    {
      title: "Vehicle Positions",
      description: "Posiciones GPS en tiempo real de los autobuses activos.",
      pb: "/api/gtfs-rt/vehicle-positions",
      json: "/api/gtfs-rt/vehicle-positions?format=json",
      icon: MapPin,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO con gradient */}
      <header className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.15), transparent 50%)",
          }}
          aria-hidden
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium">
              <Radio className="w-3 h-3 animate-pulse" />
              Datos en tiempo real
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-4 leading-[0.95]">
            Arroyo<span className="text-amber-300">Bus</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mb-8 leading-relaxed">
            Sigue los autobuses de <strong>Arroyo de la Encomienda</strong> en tiempo real.
            Llegadas, posiciones GPS y un feed GTFS-RT abierto para toda la comunidad.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg"
            >
              <Smartphone className="w-4 h-4" />
              Abrir app
            </Link>
            <a
              href="https://t.me/arroyobus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 text-white font-semibold text-sm backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors"
            >
              <Send className="w-4 h-4" />
              Canal Telegram
            </a>
            <a
              href="#mapa"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Ver mapa en vivo →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 sm:py-14 space-y-12">
        {/* Stats */}
        <section aria-label="Estadísticas en tiempo real" className="-mt-20 sm:-mt-24 relative z-10">
          <LiveStats />
        </section>

        {/* Mapa */}
        <section id="mapa" aria-labelledby="mapa-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="mapa-title" className="text-2xl font-bold tracking-tight">Mapa en vivo</h2>
            <span className="text-xs text-muted-foreground">Actualización cada 15 s</span>
          </div>
          <Suspense fallback={<div className="border border-border rounded-2xl h-[440px] bg-card animate-pulse" />}>
            <BusMap />
          </Suspense>
        </section>

        {/* Bot Telegram destacado */}
        <section
          aria-labelledby="bot-title"
          className="relative overflow-hidden rounded-2xl p-8 border border-border"
          style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Send className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="bot-title" className="text-2xl font-bold mb-1">Bot de Telegram</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Consulta paradas, configura alertas y recibe avisos cuando un bus esté a punto de llegar. Únete al canal{" "}
                <code className="px-1.5 py-0.5 rounded bg-background border border-border text-xs">@arroyobus</code>.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <code className="px-2 py-1 rounded-md bg-background border border-border">/parada 100</code>
                <code className="px-2 py-1 rounded-md bg-background border border-border">/buscar Camino</code>
                <code className="px-2 py-1 rounded-md bg-background border border-border">/alertar 100 5</code>
                <code className="px-2 py-1 rounded-md bg-background border border-border">/recordar 100 08:30</code>
              </div>
            </div>
          </div>
        </section>

        {/* Asistentes de voz */}
        <section aria-labelledby="asistentes-title" className="space-y-4">
          <div className="flex items-end justify-between flex-wrap gap-2">
            <div>
              <h2 id="asistentes-title" className="text-2xl font-bold tracking-tight">
                Asistentes y mensajería
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pregunta por una parada desde WhatsApp, Siri o Alexa.
              </p>
            </div>
            <Link
              to="/asistentes"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Cómo configurarlos →
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: MessageCircle, name: "WhatsApp", desc: "Webhook Twilio listo." },
              { icon: Mic, name: "Siri (Atajos)", desc: "Endpoint JSON para iOS." },
              { icon: Sparkles, name: "Alexa", desc: "Skill custom en español." },
            ].map((c) => (
              <Link
                key={c.name}
                to="/asistentes"
                className="group border border-border rounded-2xl p-5 bg-card hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-0.5">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Endpoints GTFS-RT */}
        <section aria-labelledby="api-title" className="space-y-4">
          <div>
            <h2 id="api-title" className="text-2xl font-bold tracking-tight">API GTFS-Realtime</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Feed abierto compatible con Google Maps, Transit App, OpenTripPlanner y cualquier cliente GTFS-RT.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {endpoints.map((ep) => (
              <article
                key={ep.title}
                className="group relative border border-border rounded-2xl p-6 bg-card hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <ep.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-semibold">{ep.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{ep.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <a
                    href={ep.pb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Protobuf <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={ep.json}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-semibold hover:bg-accent transition-colors"
                  >
                    JSON <ExternalLink className="w-3 h-3" />
                  </a>
                  <CopyButton value={ep.pb} />
                </div>
                <code className="block text-[11px] text-muted-foreground bg-background border border-border rounded-md px-2 py-1.5 truncate font-mono">
                  {ep.pb}
                </code>
              </article>
            ))}
          </div>
        </section>

        {/* GTFS Static */}
        <section
          aria-labelledby="static-title"
          className="rounded-2xl p-6 border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 id="static-title" className="text-lg font-semibold">GTFS Static</h2>
            <p className="text-sm text-muted-foreground">
              Paradas, rutas, horarios y calendario en formato GTFS.
            </p>
          </div>
          <a
            href="/GTFS_Static.zip"
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" /> Descargar .zip
          </a>
        </section>

        <footer className="pt-8 pb-12 text-center text-xs text-muted-foreground space-y-1 border-t border-border">
          <p>Datos obtenidos de la API pública de ActioSAE · ArroyoBus · Arroyo de la Encomienda</p>
          <p>
            © {new Date().getFullYear()} Mateo Fernández Prieto · Todos los derechos reservados ·{" "}
            <Link to="/aviso-legal" className="underline hover:text-foreground transition-colors">
              Aviso legal
            </Link>
            {" · "}
            <Link to="/contacto" className="underline hover:text-foreground transition-colors">
              Contacto
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
