import { Link } from "@tanstack/react-router";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "sanantonio2026-banner-dismissed";
const END = new Date("2026-06-20T00:00:00+02:00").getTime();

interface Props { compact?: boolean }

export default function SanAntonioBanner({ compact = false }: Props) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (Date.now() > END) return;
    try {
      if (localStorage.getItem(KEY) === "1") return;
    } catch {}
    setHidden(false);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setHidden(true);
  };

  return (
    <div
      role="region"
      aria-label="Aviso Fiestas de San Antonio"
      className="relative overflow-hidden rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/40 dark:to-rose-950/30 text-amber-950 dark:text-amber-100"
    >
      <div className={`flex items-start gap-3 ${compact ? "p-3" : "p-4 sm:p-5"}`}>
        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300">
            Fiestas San Antonio 2026
          </p>
          <p className={`font-semibold ${compact ? "text-sm" : "text-base"} leading-snug mt-0.5`}>
            Cambios en líneas Roja, Azul y Búho · 8–19 junio
          </p>
          {!compact && (
            <p className="text-sm mt-1 text-amber-900/80 dark:text-amber-100/80 leading-snug">
              Plaza de España suspendida del 8 al 19. Desde el miércoles 10 (17:00) solo
              para en La Flecha la <strong>Glorieta del Cañazo</strong>. Búho Fiestas
              gratuito 10–13 junio.
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              to="/avisos/san-antonio"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
            >
              Ver detalles
            </Link>
            <button
              onClick={dismiss}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-amber-900/70 dark:text-amber-100/70 hover:bg-amber-500/10 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="shrink-0 p-1 rounded-md text-amber-900/60 dark:text-amber-100/60 hover:bg-amber-500/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}