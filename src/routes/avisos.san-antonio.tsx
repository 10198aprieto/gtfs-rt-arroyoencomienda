import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, Bus, Clock, MapPin, Moon, PartyPopper, FileText, Download } from "lucide-react";

export const Route = createFileRoute("/avisos/san-antonio")({
  component: SanAntonioPage,
  head: () => ({
    meta: [
      { title: "Aviso · Fiestas de San Antonio 2026 — ArroyoBus" },
      {
        name: "description",
        content:
          "Cambios en líneas Roja, Azul y Búho durante las Fiestas de San Antonio en La Flecha (8–19 junio 2026). Recorridos, horarios y servicio especial Búho Fiestas gratuito.",
      },
      { property: "og:title", content: "Aviso · Fiestas de San Antonio 2026 — ArroyoBus" },
      {
        property: "og:description",
        content:
          "Cambios en líneas Roja, Azul y Búho durante las Fiestas de San Antonio en La Flecha. Servicio Búho Fiestas gratuito.",
      },
    ],
  }),
});

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function RouteCard({ name, color, children }: { name: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {name}
        </span>
      </div>
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function SanAntonioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-accent" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
              Aviso
            </p>
            <h1 className="text-lg font-bold truncate">Fiestas de San Antonio 2026</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-6 space-y-5">
        <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/40 dark:to-rose-950/30 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-2 text-amber-950 dark:text-amber-100">
              <p className="font-semibold">
                Del <strong>8 al 19 de junio</strong> suspendida la parada{" "}
                <strong>Plaza de España</strong>.
              </p>
              <p>
                Desde el <strong>miércoles 10 de junio a las 17:00 h</strong>, en La Flecha,
                quedan suspendidas todas las paradas (Roja, Azul y Búho) excepto{" "}
                <strong>Glorieta del Cañazo</strong>.
              </p>
              <p>
                El servicio habitual se reanudará a partir del{" "}
                <strong>lunes 15 de junio</strong> (excepto Plaza de España).
              </p>
            </div>
          </div>
        </div>

        <Section title="Recorridos modificados" icon={MapPin}>
          <RouteCard name="Línea Roja" color="#ca0d32">
            Estación de autobuses · Paseo de Zorrilla · Avda. Medina del Campo · Avda. Salamanca
            (Hipercor) · <strong>Glorieta del Cañazo</strong> · sigue recorrido habitual hasta
            c/ Cardenal Torquemada · sube a Glorieta del Cañazo dirección Valladolid.
          </RouteCard>
          <RouteCard name="Línea Azul" color="#3b4cd1">
            Recorrido habitual hasta la <strong>Glorieta del Cañazo</strong>. Desde ahí va
            directo a Avda. Salamanca (Hipercor) y continúa hacia Valladolid.
          </RouteCard>
        </Section>

        <Section title="Horarios sábado 13 y domingo 14" icon={Clock}>
          <p>
            <strong>Sábado 13:</strong> horario habitual de sábado (no festivo).
          </p>
          <ul className="ml-4 list-disc">
            <li>Roja: 06:30 → 22:30</li>
            <li>Azul: 06:45 → 22:15</li>
          </ul>
          <p>
            <strong>Domingo 14:</strong> horario habitual de sábado.
          </p>
          <ul className="ml-4 list-disc">
            <li>Roja: 08:30 → 22:30</li>
            <li>Azul: 09:00 → 22:00</li>
          </ul>
        </Section>

        <Section title="Línea Búho" icon={Moon}>
          <p>
            Solo para en <strong>Glorieta del Cañazo</strong> dentro del recorrido de La Flecha.
          </p>
          <p>
            <strong>Viernes 12 y sábado 13:</strong> 00:00 · 01:00 · 02:00 · 03:00 · 04:30.
          </p>
        </Section>

        <Section title="Búho Fiestas (servicio especial gratuito)" icon={PartyPopper}>
          <p>
            Recorrido circular urbano por Arroyo de la Encomienda. Salidas cada hora desde{" "}
            <strong>C/ Picones 15 (Glorieta del Cañazo)</strong>.
          </p>
          <ul className="ml-4 list-disc">
            <li>Miércoles 10: 00:00 → 04:00</li>
            <li>Jueves 11: 00:00 → 05:00</li>
            <li>Viernes 12: 00:00 → 06:00</li>
            <li>Sábado 13: 00:00 → 06:00</li>
          </ul>
          <p className="text-xs">
            Ya integrado en las llegadas en tiempo real bajo la línea{" "}
            <span className="inline-block px-2 py-0.5 rounded-full text-white text-[10px] font-semibold align-middle" style={{ backgroundColor: "#00416a" }}>
              Buho Fiestas
            </span>.
          </p>
        </Section>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
          >
            <Bus className="w-4 h-4" />
            Ver próximas llegadas
          </Link>
          <a
            href="https://www.aytoarroyo.es/arroyobus/aviso-arroyobus-supresion-de-paradas-por-las-fiestas-de-san-antonio-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-accent"
          >
            Comunicado oficial
          </a>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FileText className="w-5 h-5 text-primary" />
            Documentos oficiales (PDF)
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-4 flex flex-col gap-2">
              <p className="text-sm font-semibold">Aviso oficial San Antonio</p>
              <p className="text-xs text-muted-foreground">Supresión y modificación de paradas y recorridos.</p>
              <div className="flex gap-2 mt-1">
                <a href="/avisos/avisos-san-antonio.pdf" target="_blank" rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
                  <FileText className="w-3.5 h-3.5" /> Abrir
                </a>
                <a href="/avisos/avisos-san-antonio.pdf" download
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </a>
              </div>
            </div>
            <div className="rounded-xl border border-border p-4 flex flex-col gap-2">
              <p className="text-sm font-semibold">Servicio especial de fiestas</p>
              <p className="text-xs text-muted-foreground">Horarios y recorridos del Búho Fiestas gratuito.</p>
              <div className="flex gap-2 mt-1">
                <a href="/avisos/servicio-especial-fiestas.pdf" target="_blank" rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
                  <FileText className="w-3.5 h-3.5" /> Abrir
                </a>
                <a href="/avisos/servicio-especial-fiestas.pdf" download
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}