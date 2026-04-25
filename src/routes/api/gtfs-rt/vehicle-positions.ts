import { createFileRoute } from "@tanstack/react-router";
import { fetchAllArrivals, type ArrivalData } from "@/lib/gtfsrt/fetch-arrivals";
import { buildVehiclePositionsFeed, buildVehiclePositionsJson } from "@/lib/gtfsrt/encode";

export const Route = createFileRoute("/api/gtfs-rt/vehicle-positions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const format = url.searchParams.get("format");

        const all = await fetchAllArrivals();
        // Deduplicar por vehículo: cada vehículo aparece en muchas paradas,
        // pero su posición es la misma. Quedarnos con la primera ocurrencia.
        const seen = new Set<string>();
        const arrivals: ArrivalData[] = [];
        for (const a of all) {
          const key = a.vehicleId || a.tripId;
          if (!key || seen.has(key)) continue;
          seen.add(key);
          arrivals.push(a);
        }

        if (format === "json") {
          return Response.json(buildVehiclePositionsJson(arrivals), {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=15",
            },
          });
        }

        const pb = buildVehiclePositionsFeed(arrivals);
        return new Response(pb.buffer as ArrayBuffer, {
          headers: {
            "Content-Type": "application/x-protobuf",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=15",
          },
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
