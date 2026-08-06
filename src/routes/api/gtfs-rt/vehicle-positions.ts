import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = "https://enzeyiwpoomhlxmcjivn.supabase.co/functions/v1/gtfs-rt";

function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
function camelize(v: any): any {
  if (Array.isArray(v)) return v.map(camelize);
  if (v && typeof v === "object") {
    const out: any = {};
    for (const k of Object.keys(v)) out[toCamel(k)] = camelize(v[k]);
    return out;
  }
  return v;
}

export const Route = createFileRoute("/api/gtfs-rt/vehicle-positions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const format = url.searchParams.get("format");
        const target = format === "json" ? `${UPSTREAM}?format=json` : UPSTREAM;
        const cors = {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=5",
        };

        // El feed upstream falla de forma intermitente: reintentamos antes de rendirnos.
        let lastError: unknown = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const upstream = await fetch(target, {
              headers: { Accept: format === "json" ? "application/json" : "application/x-protobuf" },
              signal: AbortSignal.timeout(8000),
            });
            if (!upstream.ok) throw new Error(`upstream status ${upstream.status}`);
            if (format === "json") {
              const raw = JSON.parse(await upstream.text());
              return Response.json(camelize(raw), { status: 200, headers: cors });
            }
            const buf = await upstream.arrayBuffer();
            return new Response(buf, {
              status: 200,
              headers: { "Content-Type": "application/x-protobuf", ...cors },
            });
          } catch (e) {
            lastError = e;
          }
        }

        console.error("[vehicle-positions] upstream failed:", lastError);
        // Degradamos a un feed vacío válido para que el mapa no se rompa.
        if (format === "json") {
          return Response.json(
            {
              header: {
                gtfsRealtimeVersion: "2.0",
                incrementality: "FULL_DATASET",
                timestamp: Math.floor(Date.now() / 1000),
              },
              entity: [],
            },
            { status: 200, headers: cors },
          );
        }
        return new Response(new Uint8Array(0), {
          status: 200,
          headers: { "Content-Type": "application/x-protobuf", ...cors },
        });
      },
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      },
    },
  },
});
