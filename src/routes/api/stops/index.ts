import { createFileRoute } from "@tanstack/react-router";
import stops from "@/data/stops.json";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=3600",
};

export const Route = createFileRoute("/api/stops/")({
  server: {
    handlers: {
      GET: async () => Response.json(stops, { headers: corsHeaders }),
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
    },
  },
});
