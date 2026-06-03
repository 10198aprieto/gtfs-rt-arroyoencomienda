import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = "https://enzeyiwpoomhlxmcjivn.supabase.co/functions/v1/gtfs-rt-trip-updates";

export const Route = createFileRoute("/api/gtfs-rt/trip-updates")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const upstream = await fetch(UPSTREAM, {
            headers: { Accept: "application/x-protobuf" },
          });
          const buf = await upstream.arrayBuffer();
          return new Response(buf, {
            status: upstream.status,
            headers: {
              "Content-Type": "application/x-protobuf",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=5",
              "X-Upstream": "supabase-edge",
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
