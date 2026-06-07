import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { isSanAntonioActive, SAN_ANTONIO_BANNER_TEXT } from "@/lib/sanAntonio";

/**
 * Banner rodante horizontal con el aviso de San Antonio. Se inyecta a nivel global
 * desde `__root.tsx` para que aparezca en todas las páginas.
 */
export default function MarqueeBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(isSanAntonioActive()); }, []);
  if (!show) return null;

  const item = (
    <span className="inline-flex items-center gap-2 px-4">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      {SAN_ANTONIO_BANNER_TEXT}
      <span className="opacity-70">·</span>
      <span className="underline font-semibold">Más info</span>
      <span className="opacity-40 px-2">•</span>
    </span>
  );

  return (
    <Link
      to="/avisos/san-antonio"
      aria-label="Avisos Fiestas de San Antonio"
      className="block w-full bg-amber-500 text-amber-950 text-[12px] sm:text-sm font-medium overflow-hidden hover:bg-amber-400 transition-colors"
    >
      <div className="marquee-track flex whitespace-nowrap py-1.5">
        <div className="flex shrink-0 marquee-anim">{item}{item}{item}{item}</div>
        <div className="flex shrink-0 marquee-anim" aria-hidden>{item}{item}{item}{item}</div>
      </div>
      <style>{`
        @keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        .marquee-anim { animation: marquee-scroll 40s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .marquee-anim { animation: none; } }
      `}</style>
    </Link>
  );
}