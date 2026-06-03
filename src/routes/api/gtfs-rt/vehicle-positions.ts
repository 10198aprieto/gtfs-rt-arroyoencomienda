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
        try {
          const url = new URL(request.url);
          const format = url.searchParams.get("format");
          const target = format === "json" ? `${UPSTREAM}?format=json` : UPSTREAM;
          const upstream = await fetch(target, {
            headers: { Accept: format === "json" ? "application/json" : "application/x-protobuf" },
          });
          if (format === "json") {
            const raw = await upstream.json();
            return Response.json(camelize(raw), {
              status: upstream.status,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=5",
              },
            });
          }
          const buf = await upstream.arrayBuffer();
          return new Response(buf, {
            status: upstream.status,
            headers: {
              "Content-Type": "application/x-protobuf",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=5",
            },
          });
        } catch (e) {
          return new Response(`Upstream error: ${(e as Error).message}`, { status: 502 });
        }
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
