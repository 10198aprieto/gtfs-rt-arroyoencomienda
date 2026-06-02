import { createFileRoute } from "@tanstack/react-router";
import { fetchStopArrivals } from "@/lib/gtfsrt/fetch-arrivals";
import { getScheduledArrivals } from "@/lib/gtfsrt/schedule";

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
        const all = await fetchStopArrivals(String(params.stopId));
        const now = Math.floor(Date.now() / 1000);
        const realtime = all
          .filter((a) => a.estimatedArrival >= now - 60)
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
            isScheduled: false as const,
          }));
        const rtTripIds = new Set(realtime.map((r) => r.tripId));
        const scheduled = getScheduledArrivals(String(params.stopId), 12)
          .filter((s) => !rtTripIds.has(s.tripId))
          .map((s) => ({
            tripId: s.tripId,
            vehicleId: "",
            routeId: s.routeId,
            routeName: s.routeShortName,
            routeShortName: s.routeShortName,
            routeColor: s.routeColor,
            tripHeadsign: s.tripHeadsign,
            estimatedArrival: s.estimatedArrival,
            minutesAway: s.minutesAway,
            isEstimated: false,
            isScheduled: true as const,
          }));
        const arrivals = [...realtime, ...scheduled]
          .sort((a, b) => a.estimatedArrival - b.estimatedArrival)
          .slice(0, 8);
        return Response.json(
          { stopId: params.stopId, generatedAt: now, arrivals },
          { headers: corsHeaders }
        );
      },
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
    },
  },
});
