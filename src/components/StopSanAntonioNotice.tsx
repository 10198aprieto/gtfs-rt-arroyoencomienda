import { Link } from "@tanstack/react-router";
import { AlertTriangle, Moon, PartyPopper, MapPin } from "lucide-react";
import { stopSanAntonioStatus, BUHO_FIESTAS_SCHEDULE } from "@/lib/sanAntonio";

interface Props { stopId: string; compact?: boolean }

export default function StopSanAntonioNotice({ stopId, compact = false }: Props) {
  const status = stopSanAntonioStatus(stopId);
  if (status.kind === "none") return null;

  if (status.kind === "plaza-espana") {
    return (
      <Box tone="red" icon={AlertTriangle} title="Parada suspendida"
        subtitle="Del 8 al 19 de junio (Fiestas San Antonio)" compact={compact} />
    );
  }
  if (status.kind === "flecha-suspended") {
    return (
      <Box tone="red" icon={AlertTriangle} title="Parada suspendida en La Flecha"
        subtitle="Del mié 10 (17:00) al dom 14 jun. Usa la Glorieta del Cañazo."
        compact={compact} />
    );
  }
  if (status.kind === "canazo") {
    return (
      <Box tone="amber" icon={MapPin} title="Única parada activa en La Flecha"
        subtitle="Roja, Azul y Búho paran aquí del 10 al 14 jun." compact={compact} />
    );
  }
  // buho-fiestas
  return (
    <div className={`rounded-xl border border-indigo-400/40 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 ${compact ? "p-2.5" : "p-3"}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <PartyPopper className="w-4 h-4" />
        <p className="text-sm font-semibold">Búho Fiestas (gratuito) sale desde aquí</p>
      </div>
      <ul className="text-xs space-y-0.5 leading-snug">
        {BUHO_FIESTAS_SCHEDULE.map((d) => (
          <li key={d.date}>
            <span className="font-semibold">{d.label}:</span> {d.times.join(" · ")}
          </li>
        ))}
      </ul>
      <Link to="/avisos/san-antonio" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold underline">
        <Moon className="w-3 h-3" /> Ver recorrido Búho Fiestas
      </Link>
    </div>
  );
}

function Box({ tone, icon: Icon, title, subtitle, compact }: {
  tone: "red" | "amber"; icon: any; title: string; subtitle: string; compact?: boolean;
}) {
  const cls = tone === "red"
    ? "border-red-400/40 bg-red-50 dark:bg-red-950/30 text-red-950 dark:text-red-100"
    : "border-amber-400/40 bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100";
  return (
    <div className={`rounded-xl border ${cls} ${compact ? "p-2.5" : "p-3"} flex items-start gap-2`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-xs leading-snug mt-0.5 opacity-90">{subtitle}</p>
        <Link to="/avisos/san-antonio" className="text-xs font-semibold underline mt-1 inline-block">
          Ver detalles
        </Link>
      </div>
    </div>
  );
}