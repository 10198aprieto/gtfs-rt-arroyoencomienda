import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AIR_STATION, airBadgeClasses, categoryFor } from "@/lib/air-quality";

export default function AirQualityBadge() {
  const [data, setData] = useState<{ indice: number | null; categoria: string | null; fecha: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: row } = await supabase
          .from("air_quality_cache")
          .select("indice, categoria, fecha_dato")
          .eq("estacion", AIR_STATION)
          .maybeSingle();
        if (!cancelled && row?.fecha_dato) {
          setData({ indice: row.indice, categoria: row.categoria, fecha: row.fecha_dato });
        }
      } catch {
        /* sin dato: no se muestra nada */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!data) return null;
  const label = data.categoria ?? categoryFor(data.indice);
  if (!label) return null;

  const fecha = new Date(`${data.fecha}T00:00:00`).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${airBadgeClasses(data.indice)}`}
      title={`Estación ${AIR_STATION} · Datos abiertos Junta de Castilla y León`}
    >
      <Leaf className="w-3.5 h-3.5" />
      Calidad del aire: {label}
      <span className="font-normal opacity-70">· {fecha}</span>
    </span>
  );
}