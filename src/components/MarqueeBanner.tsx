import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listActiveAlertsPublic } from "@/lib/admin/alerts.functions";
import { isSanAntonioActive, SAN_ANTONIO_BANNER_TEXT } from "@/lib/sanAntonio";

type BannerItem = { text: string; to: string };

/**
 * Banner rodante horizontal global. Muestra los avisos activos publicados desde
 * /admin (tabla service_alerts) y, si procede, el aviso de San Antonio.
 */
export default function MarqueeBanner() {
  const load = useServerFn(listActiveAlertsPublic);
  const [items, setItems] = useState<BannerItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const next: BannerItem[] = [];
      if (isSanAntonioActive()) {
        next.push({ text: SAN_ANTONIO_BANNER_TEXT, to: "/avisos/san-antonio" });
      }
      try {
        const alerts = (await load()) as Array<{ id: string; header: string; description?: string }>;
        for (const a of alerts || []) {
          next.push({ text: a.header, to: "/avisos" });
        }
      } catch {
        /* sin avisos */
      }
      if (!cancelled) setItems(next);
    };

    refresh();
    const t = setInterval(refresh, 120_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [load]);

  if (items.length === 0) return null;

  const target = items[0].to;

  const group = (
    <>
      {items.map((it, i) => (
        <span key={`${it.text}-${i}`} className="inline-flex items-center gap-2 px-4">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {it.text}
          <span className="opacity-70">·</span>
          <span className="underline font-semibold">Más info</span>
          <span className="opacity-40 px-2">•</span>
        </span>
      ))}
    </>
  );

  const repeated = (
    <>
      {group}
      {group}
      {group}
      {group}
    </>
  );

  return (
    <Link
      to={target}
      aria-label="Avisos del servicio"
      className="block w-full bg-amber-500 text-amber-950 text-[12px] sm:text-sm font-medium overflow-hidden hover:bg-amber-400 transition-colors"
    >
      <div className="marquee-track flex whitespace-nowrap py-1.5">
        <div className="flex shrink-0 marquee-anim">{repeated}</div>
        <div className="flex shrink-0 marquee-anim" aria-hidden>{repeated}</div>
      </div>
      <style>{`
        @keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        .marquee-anim { animation: marquee-scroll 40s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .marquee-anim { animation: none; } }
      `}</style>
    </Link>
  );
}
