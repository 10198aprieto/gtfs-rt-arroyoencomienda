import { createFileRoute } from "@tanstack/react-router";
import { fetchAllVehiclePositions } from "@/lib/gtfsrt/fetch-arrivals";

export const Route = createFileRoute("/api/buses/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const vehicles = await fetchAllVehiclePositions();
          const url = new URL(request.url);
          const origin = `${url.protocol}//${url.host}`;
          const list = vehicles
            .filter((v) => v.vehicleId)
            .map((v) => ({
              vehicleId: v.vehicleId,
              label: v.vehicleName ?? v.vehicleId,
              routeId: v.routeId || null,
              lat: v.lat,
              lon: v.lon,
              speed: v.speed ?? null,
              bearing: v.bearing ?? null,
              timestamp: v.timestamp ?? null,
              url: `${origin}/api/buses/${encodeURIComponent(v.vehicleId)}`,
            }))
            .sort((a, b) => a.vehicleId.localeCompare(b.vehicleId, "es", { numeric: true }));
          return Response.json(
            { count: list.length, buses: list, updatedAt: Math.floor(Date.now() / 1000) },
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=5",
              },
            },
          );
        } catch (e) {
          return new Response(`Error: ${(e as Error).message}`, { status: 502 });
        }
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
    },
  },
});