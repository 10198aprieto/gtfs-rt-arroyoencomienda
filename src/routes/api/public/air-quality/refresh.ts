import { createFileRoute } from "@tanstack/react-router";
import { AIR_STATION, categoryFor, computeAirIndex } from "@/lib/air-quality";

const DATASET_URL =
  "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/calidad-del-aire-datos-historicos-diarios/records";

async function refresh() {
  const url = `${DATASET_URL}?where=${encodeURIComponent(`estacion="${AIR_STATION}"`)}&order_by=${encodeURIComponent("fecha desc")}&limit=1`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`JCyL API ${res.status}`);
  const json = (await res.json()) as { results?: any[] };
  const rec = json.results?.[0];
  if (!rec) throw new Error("Sin registros");

  const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : null);
  const values = {
    no_ug_m3: num(rec.no_ug_m3),
    no2_ug_m3: num(rec.no2_ug_m3),
    o3_ug_m3: num(rec.o3_ug_m3),
    pm10_ug_m3: num(rec.pm10_ug_m3),
    pm25_ug_m3: num(rec.pm25_ug_m3),
    so2_ug_m3: num(rec.so2_ug_m3),
    co_mg_m3: num(rec.co_mg_m3),
  };
  const indice = computeAirIndex(values);

  const { supabaseAdmin } = await import("@/lib/admin/supabase-admin.server");
  const { error } = await supabaseAdmin
    .from("air_quality_cache")
    .upsert(
      {
        estacion: AIR_STATION,
        provincia: rec.provincia ?? null,
        latitud: num(rec.latitud),
        longitud: num(rec.longitud),
        fecha_dato: rec.fecha,
        ...values,
        indice,
        categoria: categoryFor(indice),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "estacion" },
    );
  if (error) throw new Error(error.message);

  return { estacion: AIR_STATION, fecha: rec.fecha, indice, categoria: categoryFor(indice) };
}

async function handle() {
  try {
    const data = await refresh();
    return Response.json({ ok: true, ...data });
  } catch (e) {
    // Fallo silencioso: se mantiene el último valor cacheado.
    console.error("[air-quality] refresh failed:", e instanceof Error ? e.message : e);
    return Response.json({ ok: false, cached: true }, { status: 200 });
  }
}

export const Route = createFileRoute("/api/public/air-quality/refresh")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});