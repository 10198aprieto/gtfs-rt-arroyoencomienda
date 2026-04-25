import { createFileRoute } from "@tanstack/react-router";
import { fetchAllArrivals } from "@/lib/gtfsrt/fetch-arrivals";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=10",
};

export const Route = createFileRoute("/api/stops/$stopId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const all = await fetchAllArrivals();
        const now = Math.floor(Date.now() / 1000);
        const arrivals = all
          .filter((a) => String(a.stopId) === String(params.stopId))
          .filter((a) => a.estimatedArrival >= now - 60)
          .sort((a, b) => a.estimatedArrival - b.estimatedArrival)
          .slice(0, 8)
          .map((a) => ({
            tripId: a.tripId,
            vehicleId: a.vehicleId,
            routeId: a.routeId,
            routeName: a.routeName,
            routeShortName: a.routeShortName,
            routeColor: a.routeColor,
            tripHeadsign: a.tripHeadsign,
            estimatedArrival: a.estimatedArrival,
            minutesAway: Math.max(0, Math.round((a.estimatedArrival - now) / 60)),
            isEstimated: a.isEstimated,
          }));
        return Response.json(
          { stopId: params.stopId, generatedAt: now, arrivals },
          { headers: corsHeaders }
        );
      },
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
    },
  },
});
